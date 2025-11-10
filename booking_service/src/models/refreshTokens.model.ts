export interface RefreshToken {
	tokenHash: string;
	userId: string;
	expiresAt: number;
	createdAt: number;
	replacedBy?: string | null;
	revoked: boolean;
	ip?: string | null;
	userAgent?: string | null;
}
