import assert from "node:assert/strict";
import { test } from "node:test";

import { toScreen, visibleWeights, pointOnCallout, calloutPoints } from "./brainLayout.ts";

const origin = { left: 0, top: 0 };

test("the callout leaves from the right edge in the left column", () => {
	const points = calloutPoints(
		{ left: 40, right: 240, top: 100, height: 40 },
		{ x: 700, y: 300 },
		origin,
		true,
	);
	// Leaves at x=240 (right edge), at half height (100 + 40/2 = 120),
	// makes an elbow 26px further right, and from there to the anchor.
	assert.equal(points, "240,120 266,120 700,300");
});

test("in the right column the elbow goes the other way", () => {
	const points = calloutPoints(
		{ left: 1200, right: 1400, top: 100, height: 40 },
		{ x: 700, y: 300 },
		origin,
		false,
	);
	assert.equal(points, "1200,120 1174,120 700,300");
});

test("coordinates are relative to the canvas origin, not the window", () => {
	// The canvas doesn't always start at 0,0: if the origin isn't
	// subtracted, the line is drawn offset from the label it should touch.
	const points = calloutPoints(
		{ left: 40, right: 240, top: 100, height: 40 },
		{ x: 700, y: 300 },
		{ left: 40, top: 20 },
		true,
	);
	assert.equal(points, "200,100 226,100 700,300");
});

test("toScreen maps clip space to the pixel", () => {
	const size = { width: 1000, height: 500 };
	assert.deepEqual(toScreen({ x: 0, y: 0 }, size), { x: 500, y: 250 });
	// In clip space the Y axis grows upward; on screen, downward.
	assert.deepEqual(toScreen({ x: -1, y: 1 }, size), { x: 0, y: 0 });
	assert.deepEqual(toScreen({ x: 1, y: -1 }, size), { x: 1000, y: 500 });
});

test("a step that fills the viewport weighs 1", () => {
	const { weights, total, strength } = visibleWeights([{ index: 0, top: 0, bottom: 800 }], 800);
	assert.deepEqual(weights, [{ index: 0, weight: 1 }]);
	assert.equal(total, 1);
	assert.equal(strength, 1);
});

test("two steps mid-transition each weigh half", () => {
	const { weights, strength } = visibleWeights(
		[
			{ index: 0, top: -400, bottom: 400 },
			{ index: 1, top: 400, bottom: 1200 },
		],
		800,
	);
	assert.deepEqual(weights, [
		{ index: 0, weight: 0.5 },
		{ index: 1, weight: 0.5 },
	]);
	assert.equal(strength, 1);
});

test("a step off screen weighs nothing", () => {
	const { weights, total } = visibleWeights([{ index: 0, top: 900, bottom: 1700 }], 800);
	assert.deepEqual(weights, []);
	assert.equal(total, 0);
});

test("discards a barely-visible step", () => {
	// Half a pixel of a section can't tug the camera toward it.
	const { weights } = visibleWeights([{ index: 0, top: 799.5, bottom: 1600 }], 800);
	assert.deepEqual(weights, []);
});

test("in the hero strength is 0 and the camera returns to rest", () => {
	const { strength } = visibleWeights([], 800);
	assert.equal(strength, 0);
});

test("strength never exceeds 1 even with several steps visible", () => {
	const { total, strength } = visibleWeights(
		[
			{ index: 0, top: 0, bottom: 800 },
			{ index: 1, top: 0, bottom: 800 },
		],
		800,
	);
	assert.equal(total, 2);
	assert.equal(strength, 1);
});

test("a viewport of height 0 does not produce NaN", () => {
	// Happens for real: a resize to 0, or a measurement before layout.
	const { weights, total, strength } = visibleWeights([{ index: 0, top: 0, bottom: 100 }], 0);
	assert.deepEqual(weights, []);
	assert.equal(total, 0);
	assert.equal(strength, 0);
});

test("the pulse starts at the label, passes through the elbow and reaches the anchor", () => {
	const points = "0,0 100,0 100,200";
	assert.deepEqual(pointOnCallout(points, 0), { x: 0, y: 0 });
	assert.deepEqual(pointOnCallout(points, 0.35), { x: 100, y: 0 });
	const almostDone = pointOnCallout(points, 0.9999)!;
	assert.ok(Math.abs(almostDone.x - 100) < 1e-6 && almostDone.y > 199.9);
});

test("halfway through the first leg the pulse is halfway across the horizontal", () => {
	assert.deepEqual(pointOnCallout("0,0 100,0 100,200", 0.175), { x: 50, y: 0 });
});

test("without a valid polyline there is no pulse, instead of NaN", () => {
	// Before the first measurement the points attribute doesn't exist; a
	// label off screen can leave fewer vertices. Neither case should end up
	// with a cx="NaN" in the DOM.
	assert.equal(pointOnCallout(null, 0.5), null);
	assert.equal(pointOnCallout("", 0.5), null);
	assert.equal(pointOnCallout("0,0 100,0", 0.5), null);
	assert.equal(pointOnCallout("0,0 x,0 100,200", 0.5), null);
});
