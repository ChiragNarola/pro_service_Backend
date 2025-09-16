import { Response } from 'express';

export const successResponse = (
    res: Response,
    data: any = {},
    statusCode: number = 200
) => {
    return res.status(statusCode).json({
        isSuccess: true,
        data,
    });
};

export const successResponseMessage = (
    res: Response,
    message: string = 'Success',
    data: any = null,
    statusCode: number = 200
) => {
    return res.status(statusCode).json({
        isSuccess: true,
        message,
        data,
    });
};

export const errorResponse = (
    res: Response,
    message: string = 'Something went wrong',
    statusCode: number = 500,
    errors: any[] = []
) => {
    return res.status(statusCode).json({
        isSuccess: false,
        message,
        ...(errors.length > 0 && { errors }),
    });
};