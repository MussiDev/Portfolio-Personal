import assert from "node:assert/strict";
import { test } from "node:test";

// Cada import con un query distinto evalúa el módulo de nuevo, así cada
// caso lee process.env recién seteado.
const cargar = async (valor: string | undefined, caso: string) => {
	if (valor === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
	else process.env.NEXT_PUBLIC_SITE_URL = valor;
	const { SITE_URL } = await import(`./site.ts?caso=${caso}`);
	return SITE_URL as string;
};

test("sin variable usa el dominio por defecto", async () => {
	assert.equal(await cargar(undefined, "sin"), "https://joaquinmussi.com.ar");
});

test("una variable vacía cuenta como no configurada", async () => {
	// Así llega en GitHub Actions un secret que no existe. Con `??` quedaba ""
	// y new URL("") rompía el build.
	const url = await cargar("", "vacia");
	assert.equal(url, "https://joaquinmussi.com.ar");
	assert.doesNotThrow(() => new URL(url));
});

test("solo espacios también cuenta como no configurada", async () => {
	assert.equal(await cargar("   ", "espacios"), "https://joaquinmussi.com.ar");
});

test("un valor real se respeta", async () => {
	assert.equal(await cargar("https://staging.example.com", "real"), "https://staging.example.com");
});
