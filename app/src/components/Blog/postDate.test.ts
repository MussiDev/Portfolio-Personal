import { test } from "node:test";
import assert from "node:assert/strict";

import { formatPostDate } from "./postDate.ts";

test("formatea en español con el orden día - de - mes - de - año", () => {
	assert.equal(formatPostDate("2026-09-15T12:00:00Z", "es"), "15 de septiembre de 2026");
});

test("formatea en inglés como Month D, YYYY", () => {
	assert.equal(formatPostDate("2026-09-15T12:00:00Z", "en"), "September 15, 2026");
});
