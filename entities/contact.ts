import { z } from "zod";

/**
 * The contact message as the server accepts it. The browser used to call
 * EmailJS directly with the public key, so the captcha check was advisory:
 * anything could skip /api/verify-captcha and post to EmailJS. Now the
 * server is the only sender, and it sends only after this parses and the
 * captcha passes.
 */
export const ContactSchema = z.object({
	name: z.string().trim().min(1).max(120),
	email: z.string().trim().email().max(200),
	message: z.string().trim().min(1).max(5000),
	token: z.string().min(1).max(4000),
	/** Honeypot: hidden from people, filled by naive bots. */
	lastName: z.string().max(200).optional(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const CAPTCHA_ACTION = "contact";
export const SCORE_THRESHOLD = 0.5;

export interface SiteVerifyResponse {
	success: boolean;
	score?: number;
	action?: string;
}

/** Fail closed: a missing score or a token minted for another action is not human. */
export const isHuman = (res: SiteVerifyResponse): boolean =>
	res.success && (res.score ?? 0) >= SCORE_THRESHOLD && res.action === CAPTCHA_ACTION;
