import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import type { UserRecord } from "../services/users";
import { UserRoleSchema, type AppContext, type UserRole } from "../models/types";

// JWT Secret - In production, this should be set via environment variable
const getJWTSecret = () => {
	return new TextEncoder().encode(
		'atiohaidar-secure-jwt-secret-key-256-bits-long'
	);
};

// Token expiration time
const TOKEN_EXPIRY = '7d'; // 7 days

export type TokenPayload = {
	sub: string;
	name: string;
	role: UserRole;
	iat: number;
	exp?: number;
};

/**
 * Create a signed JWT token for a user
 * @param record - User record to create token for
 * @returns Promise that resolves to signed JWT string
 */
export const createToken = async (record: UserRecord): Promise<string> => {
	const secret = getJWTSecret();

	return await new SignJWT({
		name: record.name,
		role: record.role,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(record.username)
		.setIssuedAt()
		.setExpirationTime(TOKEN_EXPIRY)
		.sign(secret);
};

/**
 * Parse and verify a JWT token
 * @param token - JWT token string to verify
 * @returns Promise that resolves to TokenPayload or null if invalid/expired
 */
export const parseToken = async (token: string): Promise<TokenPayload | null> => {
	try {
		const secret = getJWTSecret();
		const { payload } = await jwtVerify(token, secret);

		// Validate required fields
		if (
			typeof payload.sub !== "string" ||
			typeof payload.name !== "string" ||
			typeof payload.iat !== "number" ||
			typeof payload.role !== "string"
		) {
			return null;
		}

		const roleResult = UserRoleSchema.safeParse(payload.role);
		if (!roleResult.success) {
			return null;
		}

		return {
			sub: payload.sub,
			name: payload.name as string,
			role: roleResult.data,
			iat: payload.iat,
			exp: payload.exp,
		};
	} catch (error) {
		// Token is invalid, expired, or tampered with
		console.error("JWT verification failed:", error instanceof Error ? error.message : error);
		return null;
	}
};

/**
 * Get token payload from request (async version)
 * @param c - Hono context
 * @returns Promise that resolves to TokenPayload or null
 */
export const getTokenPayloadFromRequest = async (c: AppContext): Promise<TokenPayload | null> => {
	const header = c.req.header("Authorization");
	if (!header) {
		return null;
	}

	const match = header.match(/^Bearer\s+(.+)$/i);
	if (!match) {
		return null;
	}

	return await parseToken(match[1]?.trim() ?? "");
};

/**
 * Ensure user is admin (async version)
 * @param c - Hono context
 * @returns Promise that resolves to TokenPayload or null
 */
export const ensureAdmin = async (c: AppContext): Promise<TokenPayload | null> => {
	const payload = await getTokenPayloadFromRequest(c);
	if (!payload || payload.role !== "admin") {
		return null;
	}

	return payload;
};
