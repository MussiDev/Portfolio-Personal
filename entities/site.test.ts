import assert from "node:assert/strict";
import { test } from "node:test";

// Each import with a different query re-evaluates the module, so every
// case reads process.env freshly set.
const load = async (value: string | undefined, testCase: string) => {
	if (value === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
	else process.env.NEXT_PUBLIC_SITE_URL = value;
	const { SITE_URL } = await import(`./site.ts?case=${testCase}`);
	return SITE_URL as string;
};

test("with no variable it uses the default domain", async () => {
	assert.equal(await load(undefined, "none"), "https://joaquinmussi.com.ar");
});

test("an empty variable counts as unconfigured", async () => {
	// This is how a secret that doesn't exist arrives in GitHub Actions.
	// With `??` it stayed "" and new URL("") broke the build.
	const url = await load("", "empty");
	assert.equal(url, "https://joaquinmussi.com.ar");
	assert.doesNotThrow(() => new URL(url));
});

test("whitespace-only also counts as unconfigured", async () => {
	assert.equal(await load("   ", "whitespace"), "https://joaquinmussi.com.ar");
});

test("a real value is respected", async () => {
	assert.equal(await load("https://staging.example.com", "real"), "https://staging.example.com");
});
