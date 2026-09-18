import assert from "node:assert/strict";
import { test } from "node:test";

import { aPantalla, pesosVisibles, puntoSobreCallout, puntosDelCallout } from "./brainLayout.ts";

const origen = { left: 0, top: 0 };

test("el callout sale del borde derecho en la columna izquierda", () => {
	const puntos = puntosDelCallout(
		{ left: 40, right: 240, top: 100, height: 40 },
		{ x: 700, y: 300 },
		origen,
		true,
	);
	// Sale en x=240 (borde derecho), a media altura (100 + 40/2 = 120),
	// hace codo 26px más a la derecha, y de ahí al anclaje.
	assert.equal(puntos, "240,120 266,120 700,300");
});

test("en la columna derecha el codo va para el otro lado", () => {
	const puntos = puntosDelCallout(
		{ left: 1200, right: 1400, top: 100, height: 40 },
		{ x: 700, y: 300 },
		origen,
		false,
	);
	assert.equal(puntos, "1200,120 1174,120 700,300");
});

test("las coordenadas son relativas al origen del canvas, no a la ventana", () => {
	// El canvas no siempre arranca en 0,0: si el origen no se resta, la
	// línea se dibuja desplazada respecto de la etiqueta que debería tocar.
	const puntos = puntosDelCallout(
		{ left: 40, right: 240, top: 100, height: 40 },
		{ x: 700, y: 300 },
		{ left: 40, top: 20 },
		true,
	);
	assert.equal(puntos, "200,100 226,100 700,300");
});

test("aPantalla mapea el espacio de clip al píxel", () => {
	const tam = { width: 1000, height: 500 };
	assert.deepEqual(aPantalla({ x: 0, y: 0 }, tam), { x: 500, y: 250 });
	// En clip el eje Y crece hacia arriba; en pantalla, hacia abajo.
	assert.deepEqual(aPantalla({ x: -1, y: 1 }, tam), { x: 0, y: 0 });
	assert.deepEqual(aPantalla({ x: 1, y: -1 }, tam), { x: 1000, y: 500 });
});

test("un paso que llena el viewport pesa 1", () => {
	const { pesos, total, fuerza } = pesosVisibles([{ index: 0, top: 0, bottom: 800 }], 800);
	assert.deepEqual(pesos, [{ index: 0, peso: 1 }]);
	assert.equal(total, 1);
	assert.equal(fuerza, 1);
});

test("dos pasos a mitad de transición pesan la mitad cada uno", () => {
	const { pesos, fuerza } = pesosVisibles(
		[
			{ index: 0, top: -400, bottom: 400 },
			{ index: 1, top: 400, bottom: 1200 },
		],
		800,
	);
	assert.deepEqual(pesos, [
		{ index: 0, peso: 0.5 },
		{ index: 1, peso: 0.5 },
	]);
	assert.equal(fuerza, 1);
});

test("un paso fuera de pantalla no pesa nada", () => {
	const { pesos, total } = pesosVisibles([{ index: 0, top: 900, bottom: 1700 }], 800);
	assert.deepEqual(pesos, []);
	assert.equal(total, 0);
});

test("descarta un paso apenas asomado", () => {
	// Medio píxel de una sección no puede tironear la cámara hacia ella.
	const { pesos } = pesosVisibles([{ index: 0, top: 799.5, bottom: 1600 }], 800);
	assert.deepEqual(pesos, []);
});

test("en el hero la fuerza es 0 y la cámara vuelve al reposo", () => {
	const { fuerza } = pesosVisibles([], 800);
	assert.equal(fuerza, 0);
});

test("la fuerza nunca supera 1 aunque haya varios pasos visibles", () => {
	const { total, fuerza } = pesosVisibles(
		[
			{ index: 0, top: 0, bottom: 800 },
			{ index: 1, top: 0, bottom: 800 },
		],
		800,
	);
	assert.equal(total, 2);
	assert.equal(fuerza, 1);
});

test("un viewport de alto 0 no produce NaN", () => {
	// Pasa de verdad: un resize a 0 o una medición antes del layout.
	const { pesos, total, fuerza } = pesosVisibles([{ index: 0, top: 0, bottom: 100 }], 0);
	assert.deepEqual(pesos, []);
	assert.equal(total, 0);
	assert.equal(fuerza, 0);
});

test("el pulso arranca en la etiqueta, pasa por el codo y llega al anclaje", () => {
	const puntos = "0,0 100,0 100,200";
	assert.deepEqual(puntoSobreCallout(puntos, 0), { x: 0, y: 0 });
	assert.deepEqual(puntoSobreCallout(puntos, 0.35), { x: 100, y: 0 });
	const casiFin = puntoSobreCallout(puntos, 0.9999)!;
	assert.ok(Math.abs(casiFin.x - 100) < 1e-6 && casiFin.y > 199.9);
});

test("a mitad del primer tramo el pulso está a mitad del horizontal", () => {
	assert.deepEqual(puntoSobreCallout("0,0 100,0 100,200", 0.175), { x: 50, y: 0 });
});

test("sin una polilínea válida no hay pulso, en vez de NaN", () => {
	// Antes de la primera medición el atributo points no existe; una etiqueta
	// fuera de pantalla puede dejar menos vértices. Ninguno de los dos casos
	// puede terminar en un cx="NaN" en el DOM.
	assert.equal(puntoSobreCallout(null, 0.5), null);
	assert.equal(puntoSobreCallout("", 0.5), null);
	assert.equal(puntoSobreCallout("0,0 100,0", 0.5), null);
	assert.equal(puntoSobreCallout("0,0 x,0 100,200", 0.5), null);
});
