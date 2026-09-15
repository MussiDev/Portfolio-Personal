import { test } from "node:test";
import assert from "node:assert/strict";

import { toJsonLdScript } from "./jsonLd.ts";

test("escapa </script> para que no corte el bloque de script", () => {
	const out = toJsonLdScript({ title: "hola </script><script>alert(1)</script>" });
	assert.equal(out.includes("</script>"), false);
	assert.equal(JSON.parse(out).title, "hola </script><script>alert(1)</script>");
});

test("serializa datos normales sin alterarlos", () => {
	const out = toJsonLdScript({ a: 1, b: "texto" });
	assert.deepEqual(JSON.parse(out), { a: 1, b: "texto" });
});
