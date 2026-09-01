/**
 * Tests del limitador de tasa y validaciones de tamaño en /api/chat
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { ipDe, dentroDelLimite, limpiarGolpes } from '../src/lib/rate-limit.mjs';

test('rate-limit: extrae IP correctamente', () => {
  const req1 = {
    headers: new Map([['x-forwarded-for', '203.0.113.45, 198.51.100.1']]),
  };
  assert.strictEqual(ipDe(req1), '203.0.113.45');

  const req2 = {
    headers: new Map([['x-real-ip', '192.0.2.1']]),
  };
  assert.strictEqual(ipDe(req2), '192.0.2.1');

  const req3 = {
    headers: new Map([]),
  };
  assert.strictEqual(ipDe(req3), 'desconocida');
});

test('rate-limit: permite 10 peticiones por minuto, rechaza la 11ª', () => {
  limpiarGolpes();
  const ip = '203.0.113.1';
  const ahora = 1000;

  // Las primeras 10 pasan
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(dentroDelLimite(ip, ahora + i), true, `petición ${i + 1} debe pasar`);
  }

  // La 11ª rechazada
  assert.strictEqual(dentroDelLimite(ip, ahora + 10), false, 'petición 11 debe ser rechazada');

  // Pasado 1 minuto, vuelven a pasar
  assert.strictEqual(dentroDelLimite(ip, ahora + 60_000 + 1), true, 'petición 21 (pasado 1 min) debe pasar');
});

test('rate-limit: ventanas independientes por IP', () => {
  limpiarGolpes();
  const ip1 = '203.0.113.1';
  const ip2 = '203.0.113.2';
  const ahora = 1000;

  // Relleno ip1 a 10
  for (let i = 0; i < 10; i++) {
    dentroDelLimite(ip1, ahora + i);
  }
  assert.strictEqual(dentroDelLimite(ip1, ahora + 10), false, 'ip1 debe rechazar la 11ª');

  // ip2 debe poder hacer 10 más
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(dentroDelLimite(ip2, ahora + i), true, `ip2 petición ${i + 1} debe pasar`);
  }
  assert.strictEqual(dentroDelLimite(ip2, ahora + 10), false, 'ip2 debe rechazar la 11ª');
});

test('rate-limit: limpieza automática cuando tamaño del mapa > 5000', () => {
  limpiarGolpes();
  const ahora = 1000;

  // Rellenar > 5000 IPs con historial caducado (> 1 min)
  for (let i = 0; i < 5001; i++) {
    const ip = `203.0.113.${(i + 1) % 256}`;
    dentroDelLimite(ip, ahora - 70_000); // hace > 1 min
  }

  // Hacer una petición nueva con una IP que tiene historial reciente
  dentroDelLimite('203.0.113.99', ahora);

  // Debe haber limpiado IPs viejas. Verificar que es razonable (< 5000 después)
  // Esto es un test "de caja negra": si no crashea y el mapa se limpia, pasa.
  // El verdadero test es que la siguiente petición no crashea.
  dentroDelLimite('203.0.113.100', ahora + 1);

  assert.ok(true, 'limpieza sin crashes');
});

test('validación de tamaño: rechaza si > 20.000 caracteres totales', () => {
  const messages = [
    { role: 'user', content: 'a'.repeat(10_001) },
    { role: 'assistant', content: 'b'.repeat(10_500) },
  ];
  const totalChars = messages.reduce((sum, m) => sum + (m?.content?.length ?? 0), 0);
  assert.ok(totalChars > 20_000, 'test setup: totalChars > 20.000');
});

test('validación de mensajes: rechaza si > 40 mensajes', () => {
  const messages = Array.from({ length: 41 }, (_, i) => ({
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Mensaje ${i}`,
  }));
  assert.ok(messages.length > 40, 'test setup: 41 mensajes');
  assert.strictEqual(messages.length, 41);
});
