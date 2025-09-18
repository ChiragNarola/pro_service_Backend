console.log("Running seed.ts...");

import { PrismaClient, RoleName, PlanName, PaymentGateway } from '@prisma/client';
import { hashPassword } from '../src/utils/commonHelper';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding roles...");
    await prisma.role.createMany({
        data: [
            { name: RoleName.SuperAdmin, createdBy: 'system' },
            { name: RoleName.Company, createdBy: 'system' },
            { name: RoleName.Manager, createdBy: 'system' },
            { name: RoleName.Client, createdBy: 'system' },
            { name: RoleName.Employee, createdBy: 'system' }
        ],
        skipDuplicates: true,
    });

    const superAdminRole = await prisma.role.findUnique({
        where: { name: RoleName.SuperAdmin },
    });

    const hashedPassword = await hashPassword('12345678');

    console.log("Seeding super admin users...");
    await prisma.user.createMany({
        data: [
            {
                name: 'Chirag',
                lastName: 'Narola',
                email: 'cpl@narola.email',
                password: hashedPassword,
                mobileNumber: '9876543210',
                createdBy: 'system',
                status: 'Active',
                roleId: superAdminRole?.id
            }
        ],
        skipDuplicates: true,
    });

    console.log("Seeding Modules...");
    await prisma.module.createMany({
        data: [
            {
                name: 'Basic job management',
                createdBy: 'system'
            },
            {
                name: 'Client portal',
                createdBy: 'system'
            },
            {
                name: 'Email support',
                createdBy: 'system'
            },
            {
                name: 'Advanced scheduling',
                createdBy: 'system'
            },
            {
                name: 'Inventory management',
                createdBy: 'system'
            },
            {
                name: 'Analytics & reports',
                createdBy: 'system'
            },
            {
                name: 'Priority support',
                createdBy: 'system'
            },
            {
                name: 'Custom integrations',
                createdBy: 'system'
            },
            {
                name: 'Advanced analytics',
                createdBy: 'system'
            },
            {
                name: 'Dedicated support',
                createdBy: 'system'
            },
            {
                name: 'White-label options',
                createdBy: 'system'
            },
            {
                name: 'Employee',
                createdBy: 'system'
            },
        ],
        skipDuplicates: true,
    });

    console.log("Seeding Subscriptions...");
    await prisma.subscription.createMany({
        data: [
            {
                planName: PlanName.Starter,
                duration: 'Annual',
                rate: 49,
                createdBy: 'system'
            },
            {
                planName: PlanName.Professional,
                duration: 'Annual',
                rate: 99,
                isPopular: true,
                createdBy: 'system'
            },
            {
                planName: PlanName.Enterprise,
                duration: 'Annual',
                rate: 199,
                createdBy: 'system'
            }
        ],
        skipDuplicates: true,
    });

    const StarterPlan = await prisma.subscription.findFirst({
        where: { planName: PlanName.Starter },
    });
    const ProfessionalPlan = await prisma.subscription.findFirst({
        where: { planName: PlanName.Professional },
    });
    const EnterprisePlan = await prisma.subscription.findFirst({
        where: { planName: PlanName.Enterprise },
    });
    const basicJobManagement = await prisma.module.findFirst({
        where: { name: "Basic job management" },
    });
    const clientPortal = await prisma.module.findFirst({
        where: { name: "Client portal" },
    });
    const emailSupport = await prisma.module.findFirst({
        where: { name: "Email support" },
    });
    const advancedScheduling = await prisma.module.findFirst({
        where: { name: "Advanced scheduling" },
    });
    const inventoryManagement = await prisma.module.findFirst({
        where: { name: "Inventory management" },
    });
    const analyticsReports = await prisma.module.findFirst({
        where: { name: "Analytics & reports" },
    });
    const prioritySupport = await prisma.module.findFirst({
        where: { name: "Priority support" },
    });
    const customIntegrations = await prisma.module.findFirst({
        where: { name: "Custom integrations" },
    });
    const advancedAnalytics = await prisma.module.findFirst({
        where: { name: "Advanced analytics" },
    });
    const dedicatedSupport = await prisma.module.findFirst({
        where: { name: "Dedicated support" },
    });
    const whiteLabelOptions = await prisma.module.findFirst({
        where: { name: "White-label options" },
    });
    const employee = await prisma.module.findFirst({
        where: { name: "Employee" },
    });

    await prisma.modulePlanMapping.createMany({
        data: [
            {
                subscriptionId: StarterPlan?.id,
                moduleId: employee?.id,
                maxEmployees: "5",
                createdBy: 'system'
            },
            {
                subscriptionId: StarterPlan?.id,
                moduleId: basicJobManagement?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: StarterPlan?.id,
                moduleId: clientPortal?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: StarterPlan?.id,
                moduleId: emailSupport?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: employee?.id,
                maxEmployees: "25",
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: advancedScheduling?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: inventoryManagement?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: analyticsReports?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: prioritySupport?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: employee?.id,
                maxEmployees: "Unlimited",
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: customIntegrations?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: advancedAnalytics?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: dedicatedSupport?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: whiteLabelOptions?.id,
                createdBy: 'system'
            },
        ],
        skipDuplicates: true,
    });

    await prisma.department.createMany({
        data: [
            { name: 'Engineering' },
            { name: 'Human Resources' },
            { name: 'Marketing' },
            { name: 'Sales' },
            { name: 'Finance' },
            { name: 'Customer Support' },
            { name: 'IT' },
            { name: 'Legal' },
            { name: 'Operations' },
            { name: 'Product Management' },
            { name: 'Design' },
            { name: 'Research and Development' },
            { name: 'Procurement' },
            { name: 'Quality Assurance' },
        ],
        skipDuplicates: true,
    });

    await prisma.employeeRole.createMany({
        data: [
            { name: 'Software Engineer' },
            { name: 'HR Manager' },
            { name: 'Marketing Specialist' },
            { name: 'Sales Representative' },
            { name: 'Financial Analyst' },
            { name: 'Customer Support Agent' },
            { name: 'IT Administrator' },
            { name: 'Legal Counsel' },
            { name: 'Operations Manager' },
            { name: 'Product Manager' },
            { name: 'UI/UX Designer' },
            { name: 'R&D Scientist' },
            { name: 'Procurement Officer' },
            { name: 'QA Engineer' },
        ],
        skipDuplicates: true,
    });

    // Seed Services
    await prisma.services.createMany({
        data: [
            { serviceName: 'Web Development', createdBy: 'system' },
            { serviceName: 'Mobile App Development', createdBy: 'system' },
            { serviceName: 'UI/UX Design', createdBy: 'system' },
            { serviceName: 'Database Design', createdBy: 'system' },
            { serviceName: 'API Development', createdBy: 'system' },
            { serviceName: 'Cloud Infrastructure Setup', createdBy: 'system' },
            { serviceName: 'DevOps Services', createdBy: 'system' },
            { serviceName: 'Quality Assurance Testing', createdBy: 'system' },
            { serviceName: 'Security Audit', createdBy: 'system' },
            { serviceName: 'Performance Optimization', createdBy: 'system' },
            { serviceName: 'Technical Consulting', createdBy: 'system' },
            { serviceName: 'System Integration', createdBy: 'system' },
            { serviceName: 'Data Migration', createdBy: 'system' },
            { serviceName: 'Training & Support', createdBy: 'system' },
            { serviceName: 'Maintenance & Updates', createdBy: 'system' },
            { serviceName: 'SEO Optimization', createdBy: 'system' },
            { serviceName: 'Content Management', createdBy: 'system' },
            { serviceName: 'E-commerce Solutions', createdBy: 'system' },
            { serviceName: 'Analytics Implementation', createdBy: 'system' },
            { serviceName: 'Backup & Recovery', createdBy: 'system' },
        ],
        skipDuplicates: true,
    });
    const superAdminUser = await prisma.user.findFirst({
        where: { roleId: superAdminRole?.id },
    });
    console.log("🚀 ~ main ~ superAdminUser:", superAdminUser)
    await prisma.systemSettings.createMany({
        data: [
            { userId: superAdminUser?.id, emailNotifications: false, smsNotifications: false, paymentGateway: PaymentGateway.Stripe, createdBy: 'system' }
        ],
        skipDuplicates: true,
    });
    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
