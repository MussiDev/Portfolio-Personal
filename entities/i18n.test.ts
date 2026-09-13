import { test } from "node:test";
import assert from "node:assert/strict";

import { localizedPath } from "./i18n.ts";

test("localizedPath: default language (es) is never prefixed", () => {
	assert.equal(localizedPath("es", "/"), "/");
	assert.equal(localizedPath("es", "/blog/hola"), "/blog/hola");
});

test("localizedPath: non-default language gets prefixed", () => {
	assert.equal(localizedPath("en", "/"), "/en");
	assert.equal(localizedPath("en", "/blog/hola"), "/en/blog/hola");
});

test("localizedPath: normalizes a missing leading slash", () => {
	assert.equal(localizedPath("es", "blog/hola"), "/blog/hola");
	assert.equal(localizedPath("en", "blog/hola"), "/en/blog/hola");
});

test("localizedPath: defaults the path to root", () => {
	assert.equal(localizedPath("es"), "/");
	assert.equal(localizedPath("en"), "/en");
});
