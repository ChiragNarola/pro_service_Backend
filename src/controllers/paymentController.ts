import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient, SubscriptionType, UserStatus } from '@prisma/client';
import { forgotPassword } from '../services/authService';
import { sendEmail } from '../utils/mailer';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const buildCompanyShort = (name: string | null | undefined): string => {
  const cleaned = String(name || '')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (cleaned.length === 0) return 'CMP';
  const initials = cleaned.map(w => w[0]).join('');
  const candidate = (initials || cleaned.join('')).toUpperCase();
  return candidate.slice(0, 4);
};

const generateInvoiceNumber = async (companyId: string): Promise<string> => {
  const company = await prisma.companyDetail.findUnique({ where: { id: companyId }, select: { companyName: true } });
  const short = buildCompanyShort(company?.companyName);
  const now = new Date();
  const year = now.getFullYear();
  const firstOfYear = new Date(year, 0, 1);
  const nextNumber = (await prisma.companyPlanDetail.count({
    where: {
      companyId,
      createdDate: { gte: firstOfYear },
    },
  })) + 1;
  const seq = String(nextNumber).padStart(3, '0');
  return `INV-${short}-${year}-${seq}`;
};

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
export const stripe = new Stripe(stripeSecret || '');

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const planId: string | undefined = payload?.planId;
    if (!planId) {
      return res.status(400).json({ message: 'planId is required' });
    }

    const email: string | undefined = payload?.email;
    if (!email) return res.status(400).json({ message: 'Admin email is required' });
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const role = await prisma.role.findFirst({ where: { name: 'Company' as any }, select: { id: true } });
    const hashedPassword = await bcrypt.hash(String(payload.password || '12345678'), 10);
    const createdUser = await prisma.user.create({
      data: {
        name: payload.name,
        lastName: payload.lastName,
        email: email.toLowerCase(),
        mobileNumber: payload.mobileNumber,
        password: hashedPassword,
        createdBy: `${payload.name || ''} ${payload.lastName || ''}`.trim() || 'system',
        roleId: role?.id || null,
        status: 'InActive' as UserStatus,
      },
      select: { id: true }
    });

    const createdCompany = await prisma.companyDetail.create({
      data: {
        userId: createdUser.id,
        companyName: payload.companyName,
        industry: payload.industry,
        companyEmail: payload.companyEmail,
        companyMobileNumber: payload.companyMobileNumber,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        planId: planId,
        isActive: false,
        createdBy: `${payload.name || ''} ${payload.lastName || ''}`.trim() || 'system',
      },
      select: { id: true }
    });

    const plan = await prisma.subscription.findUnique({ where: { id: planId } });
    if (!plan) return res.status(400).json({ message: 'Invalid planId' });

    const amountCents = Math.round((plan.rate || 0) * 100);

    const metadata: Record<string, string> = {
      userId: createdUser.id,
      companyId: createdCompany.id,
      planId: String(planId),
    };

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/$/, '');
    const backendUrl = (process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      metadata,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: { name: `${plan.planName} Plan` },
            unit_amount: amountCents,
          },
        },
      ],
      success_url: `${frontendUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/signup/cancelled`,
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error('createCheckoutSession error:', msg);
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return res.status(500).json({ message: `Failed to create checkout session: ${msg}` });
    }
    return res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent((req as any).rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const decoded = {
        userId: session.metadata?.userId,
        companyId: session.metadata?.companyId,
        planId: session.metadata?.planId,
      } as any;

      if (decoded) {
        const updatedUser = await prisma.user.update({
          where: { id: decoded.userId },
          data: { status: 'Active' as UserStatus, modifiedDate: new Date() },
          select: { id: true, name: true, lastName: true, email: true }
        });

        const updatedCompany = await prisma.companyDetail.update({
          where: { id: decoded.companyId },
          data: { isActive: true, modifiedDate: new Date() },
          select: { id: true }
        });

        let cardBrand: string | undefined;
        let cardLast4: string | undefined;
        let cardExpMonth: number | undefined;
        let cardExpYear: number | undefined;
        let chargeId: string | undefined;
        let receiptUrl: string | undefined;
        let amountCents: number | undefined;
        let currency: string | undefined;
        try {
          if (session.payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string, { expand: ['latest_charge'] });
            amountCents = typeof pi.amount === 'number' ? pi.amount : undefined;
            currency = pi.currency;
            const latestCharge = typeof pi.latest_charge === 'string' ? await stripe.charges.retrieve(pi.latest_charge) : (pi.latest_charge as any);
            if (latestCharge) {
              chargeId = latestCharge.id;
              receiptUrl = latestCharge.receipt_url || undefined;
              const pm = latestCharge.payment_method_details?.card;
              if (pm) {
                cardBrand = pm.brand;
                cardLast4 = pm.last4;
                cardExpMonth = pm.exp_month as any;
                cardExpYear = pm.exp_year as any;
              }
            }
          }
        } catch (e) {
          console.error('Failed to read payment details:', (e as any)?.message || e);
        }

        try {
          const plan = await prisma.subscription.findUnique({ where: { id: decoded.planId } });
          const startDate = new Date();
          let endDate: Date | null = null;
          if (plan?.duration === SubscriptionType.Monthly) {
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (plan?.duration === SubscriptionType.Annual) {
            endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
          }
          const invoiceNumber = await generateInvoiceNumber(decoded.companyId);
          await prisma.companyPlanDetail.create({
            data: ({
              companyId: decoded.companyId,
              userId: decoded.userId,
              planId: decoded.planId,
              startDate,
              endDate,
              isActive: true,
              createdBy: `${updatedUser.name || ''} ${updatedUser.lastName || ''}`.trim() || updatedUser.email,
              amountCents: amountCents,
              currency: currency?.toUpperCase(),
              paymentIntentId: (session.payment_intent as string) || null,
              chargeId: chargeId,
              cardBrand: cardBrand,
              cardLast4: cardLast4,
              cardExpMonth: cardExpMonth as any,
              cardExpYear: cardExpYear as any,
              receiptUrl: receiptUrl,
              invoiceNumber,
            } as any),
          });
        } catch (e) {
          console.error('Failed to store company plan detail after payment:', (e as any)?.message || e);
        }

        try {
          await forgotPassword(updatedUser.email);
        } catch (e) {
          console.error('Failed to send reset password email after payment:', (e as any)?.message || e);
        }

        try {
          const appUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/$/, '');
          const freshUser = await prisma.user.findUnique({ where: { id: updatedUser.id }, select: { passwordResetToken: true } });
          const resetUrl = freshUser?.passwordResetToken ? `${appUrl}/reset-password?token=${encodeURIComponent(freshUser.passwordResetToken)}` : `${appUrl}/reset-password`;
          await sendEmail({
            to: [updatedUser.email],
            subject: 'Welcome to Pro Service - Your company is set up',
            html: `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
                    <h2 style="margin:0 0 12px">Thank you for registering your company</h2>
                    <p>Your payment was successful and your account is ready.</p>
                    <p><a href="${appUrl}/login" target="_blank" rel="noopener" style="background:#0d6efd;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Go to Login</a></p>
                    <p style="margin-top:12px;color:#555;font-size:14px">Set your password here:</p>
                    <p><a href="${resetUrl}" target="_blank" rel="noopener">${resetUrl}</a></p>
                 </div>`,
            text: `Thank you for registering. Login: ${appUrl}/login\nReset password: ${resetUrl}`,
          });
        } catch (e) {
          console.error('Failed to send welcome email:', (e as any)?.message || e);
        }
      }
    }

    res.json({ received: true });
  } catch (e: any) {
    console.error('stripeWebhook error:', e?.message || e);
    res.status(500).json({ message: 'Webhook handling failed' });
  }
};

export const finalizeBySessionId = async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.query.session_id || '');
    if (!sessionId) return res.status(400).json({ message: 'session_id is required' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.metadata?.userId as string;
    const companyId = session.metadata?.companyId as string;
    const planId = session.metadata?.planId as string;
    if (!userId || !companyId || !planId) return res.status(400).json({ message: 'Missing metadata on session' });

    const existing = await prisma.companyPlanDetail.findFirst({ where: { companyId, isActive: true }, select: { id: true } });
    if (!existing) {
      let cardBrand: string | undefined;
      let cardLast4: string | undefined;
      let cardExpMonth: number | undefined;
      let cardExpYear: number | undefined;
      let chargeId: string | undefined;
      let receiptUrl: string | undefined;
      let amountCents: number | undefined;
      let currency: string | undefined;
      if (session.payment_intent) {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string, { expand: ['latest_charge'] });
        amountCents = typeof pi.amount === 'number' ? pi.amount : undefined;
        currency = pi.currency;
        const latestCharge = typeof pi.latest_charge === 'string' ? await stripe.charges.retrieve(pi.latest_charge) : (pi.latest_charge as any);
        if (latestCharge) {
          chargeId = latestCharge.id;
          receiptUrl = latestCharge.receipt_url || undefined;
          const pm = latestCharge.payment_method_details?.card;
          if (pm) {
            cardBrand = pm.brand;
            cardLast4 = pm.last4;
            cardExpMonth = pm.exp_month as any;
            cardExpYear = pm.exp_year as any;
          }
        }
      }

      const plan = await prisma.subscription.findUnique({ where: { id: planId } });
      const startDate = new Date();
      let endDate: Date | null = null;
      if (plan?.duration === SubscriptionType.Monthly) {
        endDate = new Date(startDate); endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan?.duration === SubscriptionType.Annual) {
        endDate = new Date(startDate); endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const invoiceNumber = await generateInvoiceNumber(companyId);
      await prisma.companyPlanDetail.create({
        data: ({
          companyId,
          userId,
          planId,
          startDate,
          endDate,
          isActive: true,
          createdBy: 'system',
          amountCents,
          currency: currency?.toUpperCase(),
          paymentIntentId: (session.payment_intent as string) || null,
          chargeId,
          cardBrand,
          cardLast4,
          cardExpMonth: cardExpMonth as any,
          cardExpYear: cardExpYear as any,
          receiptUrl,
          invoiceNumber,
        } as any),
      });
    }

    await prisma.user.update({ where: { id: userId }, data: { status: 'Active' as UserStatus, modifiedDate: new Date() } });
    await prisma.companyDetail.update({ where: { id: companyId }, data: { isActive: true, modifiedDate: new Date() } });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      try {
        const appUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/$/, '');
        const freshUser = await prisma.user.findUnique({ where: { id: userId }, select: { passwordResetToken: true } });
        const resetUrl = freshUser?.passwordResetToken ? `${appUrl}/reset-password?token=${encodeURIComponent(freshUser.passwordResetToken)}` : `${appUrl}/reset-password`;
        console.log("🚀 ~ finalizeBySessionId ~ resetUrl:", resetUrl)
        await sendEmail({
          to: [user.email],
          subject: 'Welcome to Pro Service - Your company is set up',
          html: `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
                  <h2 style="margin:0 0 12px">Thank you for registering your company</h2>
                  <p>Your payment was successful and your account is ready.</p>
                  <p><a href="${appUrl}/login" target="_blank" rel="noopener" style="background:#0d6efd;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Go to Login</a></p>
                 <p style="margin-top:12px;color:#555;font-size:14px">Set your password here:</p>
                    <p><a href="${resetUrl}" target="_blank" rel="noopener">${resetUrl}</a></p>
                 </div>`,
          text: `Thank you for registering. Login: ${appUrl}/login\nReset password: ${resetUrl}`,
        });
      }
      catch { }
    }

    return res.json({ success: true });
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error('finalizeBySessionId error:', msg);
    return res.status(500).json({ message: 'Failed to finalize after success' });
  }
};