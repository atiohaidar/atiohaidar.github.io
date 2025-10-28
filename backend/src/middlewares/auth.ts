import type { UserRecord } from "../services/users";
import { UserRoleSchema, type AppContext, type UserRole } from "../models/types";

export type TokenPayload = {
	sub: string;
	name: string;
	role: UserRole;
	iat: number;
};

export const createToken = (record: UserRecord): string => {
	const payload: TokenPayload = {
		sub: record.username,
		name: record.name,
		role: record.role,
		iat: Date.now(),
	};

	return btoa(JSON.stringify(payload));
};

export const parseToken = (token: string): TokenPayload | null => {
	try {
		const decoded = atob(token);
		const candidate = JSON.parse(decoded) as Partial<TokenPayload>;

		if (
			typeof candidate?.sub !== "string" ||
			typeof candidate?.name !== "string" ||
			typeof candidate?.iat !== "number" ||
			typeof candidate?.role !== "string"
		) {
			return null;
		}

		const roleResult = UserRoleSchema.safeParse(candidate.role);
		if (!roleResult.success) {
			return null;
		}

		return {
			sub: candidate.sub,
			name: candidate.name,
			role: roleResult.data,
			iat: candidate.iat,
		};
	} catch (error) {
		console.error("Failed to parse token", error);
		return null;
	}
};

export const getTokenPayloadFromRequest = (c: AppContext): TokenPayload | null => {
	const header = c.req.header("Authorization");
	if (!header) {
		return null;
	}

	const match = header.match(/^Bearer\s+(.+)$/i);
	if (!match) {
		return null;
	}

	return parseToken(match[1]?.trim() ?? "");
};

export const ensureAdmin = (c: AppContext): TokenPayload | null => {
	const payload = getTokenPayloadFromRequest(c);
	if (!payload || payload.role !== "admin") {
		return null;
	}

	return payload;
};
