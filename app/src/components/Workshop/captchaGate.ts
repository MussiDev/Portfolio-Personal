/**
 * Decide si un envío del formulario debe bloquearse por falta de captcha.
 *
 * Fail closed: si no hay sitekey configurada no hay forma de verificar el
 * captcha, así que el envío se bloquea en vez de saltear la protección en
 * silencio (regresión real: NEXT_PUBLIC_FIRSTCAPTCHA ausente dejaba pasar
 * cualquier envío sin captcha).
 */
export const shouldBlockSubmission = (
	sitekey: string | undefined,
	captchaOk: boolean,
): boolean => !sitekey || !captchaOk;
