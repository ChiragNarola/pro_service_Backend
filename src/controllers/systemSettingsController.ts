import { Request, Response } from 'express';
import { getSystemSettingsByUserId, upsertSystemSettings } from '../services/systemSettingsService';
import { successResponse, errorResponse } from '../utils/responseHelper';

export const getSettingsController = async (req: Request, res: Response) => {
    try {
        const data = await getSystemSettingsByUserId();
        return successResponse(res, data ?? {}, 200);
    } catch (e: any) {
        return errorResponse(res, e?.message || 'Failed to fetch settings', 500);
    }
};

export const updateSettingsController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params as { userId: string };
        if (!userId) return errorResponse(res, 'userId is required', 400);
        const actorId = (req.user?.id as string) || 'system';
        const updated = await upsertSystemSettings(userId, req.body, actorId);
        return successResponse(res, updated, 200);
    } catch (e: any) {
        return errorResponse(res, e?.message || 'Failed to update settings', 500);
    }
};