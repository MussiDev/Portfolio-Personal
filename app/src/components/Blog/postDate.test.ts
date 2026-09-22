import { test } from "node:test";
import assert from "node:assert/strict";

import { formatPostDate } from "./postDate.ts";

test("formats in Spanish with the day - de - month - de - year order", () => {
	assert.equal(formatPostDate("2026-09-15T12:00:00Z", "es"), "15 de septiembre de 2026");
});

test("formats in English as Month D, YYYY", () => {
	assert.equal(formatPostDate("2026-09-15T12:00:00Z", "en"), "September 15, 2026");
});
