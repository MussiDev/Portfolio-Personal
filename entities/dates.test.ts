import { test } from "node:test";
import assert from "node:assert/strict";

import { formatMonth, formatPeriod, YEAR_MONTH } from "./dates.ts";

test("formatMonth: each language gets its own month name", () => {
	assert.equal(formatMonth("2022-06", "en"), "Jun 2022");
	assert.match(formatMonth("2022-06", "es"), /^jun\.? 2022$/);
	assert.match(formatMonth("2023-01", "es"), /^ene\.? 2023$/);
});

test("formatMonth: the first of the month never slips to the previous one", () => {
	// Regression guard for local-time parsing (UTC-3 turns June 1 into May 31).
	assert.equal(formatMonth("2022-06", "en"), "Jun 2022");
	assert.equal(formatMonth("2021-01", "en"), "Jan 2021");
});

test("formatPeriod: an open period reads as ongoing in each language", () => {
	assert.equal(formatPeriod({ from: "2023-11", to: null }, "en"), "Nov 2023 – present");
	assert.match(formatPeriod({ from: "2023-11", to: null }, "es"), /actualidad$/);
});

test("formatPeriod: a closed period shows both ends", () => {
	assert.equal(formatPeriod({ from: "2022-02", to: "2022-07" }, "en"), "Feb 2022 – Jul 2022");
});

test("YEAR_MONTH rejects display text", () => {
	assert.ok(YEAR_MONTH.test("2022-06"));
	assert.ok(!YEAR_MONTH.test("Jun 2022"));
	assert.ok(!YEAR_MONTH.test("2022-13"));
});
