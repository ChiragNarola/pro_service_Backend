export interface AuthenticatedRequest {
    id: string;
    role: string;
    organization?: string;
    [key: string]: any;
}