import { test } from "node:test";
import assert from "node:assert/strict";

import { ContactSchema, isHuman } from "./contact.ts";

const valid = {
	name: "Ada",
	email: "ada@example.com",
	message: "Hola",
	token: "t",
};

test("ContactSchema accepts a well-formed message", () => {
	assert.equal(ContactSchema.safeParse(valid).success, true);
});

test("ContactSchema rejects a message without captcha token", () => {
	assert.equal(ContactSchema.safeParse({ ...valid, token: undefined }).success, false);
});

test("ContactSchema rejects blank fields and bad emails", () => {
	assert.equal(ContactSchema.safeParse({ ...valid, name: "   " }).success, false);
	assert.equal(ContactSchema.safeParse({ ...valid, email: "not-an-email" }).success, false);
});

test("ContactSchema caps the message size", () => {
	assert.equal(ContactSchema.safeParse({ ...valid, message: "x".repeat(5001) }).success, false);
});

const ok = { success: true, score: 0.9, action: "contact" };

test("isHuman: a good score for the right action passes", () => {
	assert.equal(isHuman(ok), true);
});

test("isHuman fails closed", () => {
	assert.equal(isHuman({ ...ok, success: false }), false);
	assert.equal(isHuman({ ...ok, score: undefined }), false);
	assert.equal(isHuman({ ...ok, score: 0.3 }), false);
	assert.equal(isHuman({ ...ok, action: "login" }), false);
});
