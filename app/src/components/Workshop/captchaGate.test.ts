import { test } from "node:test";
import assert from "node:assert/strict";

import { shouldBlockSubmission } from "./captchaGate.ts";

test("bloquea cuando no hay sitekey configurada, sin importar captchaOk", () => {
	assert.equal(shouldBlockSubmission(undefined, true), true);
	assert.equal(shouldBlockSubmission(undefined, false), true);
});

test("bloquea cuando hay sitekey pero el captcha no se resolvió", () => {
	assert.equal(shouldBlockSubmission("site_123", false), true);
});

test("deja pasar solo cuando hay sitekey y el captcha se resolvió", () => {
	assert.equal(shouldBlockSubmission("site_123", true), false);
});
