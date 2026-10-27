const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch(e) {
          parsed = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });
    req.on('error', reject);
    if (data) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      req.write(payload);
    }
    req.end();
  });
}

function post(path, data, token = null) {
  const payload = JSON.stringify(data);
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return request({ hostname: 'localhost', port: 5000, path, method: 'POST', headers }, payload);
}

function get(path, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return request({ hostname: 'localhost', port: 5000, path, method: 'GET', headers });
}

function put(path, data, token = null) {
  const payload = JSON.stringify(data);
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return request({ hostname: 'localhost', port: 5000, path, method: 'PUT', headers }, payload);
}

function del(path, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return request({ hostname: 'localhost', port: 5000, path, method: 'DELETE', headers });
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('🧪 SUITE INTEGRAL DE CALIDAD Y ACEPTACIÓN - DESPENSA+');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Healthcheck & OWASP Helmet Headers
  console.log('--- 1. Healthcheck & Cabeceras de Seguridad OWASP ---');
  const healthRes = await get('/api/health');
  assert(healthRes.status === 200, 'Endpoint /api/health responde HTTP 200');
  assert(healthRes.data?.status === 'ok', 'Status de salud es "ok"');
  assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'Cabecera OWASP X-Content-Type-Options: nosniff presente');
  assert(healthRes.headers['x-frame-options'] === 'SAMEORIGIN', 'Cabecera OWASP X-Frame-Options: SAMEORIGIN presente');

  // 2. Control de Acceso no autorizado (OWASP A01: Broken Access Control)
  console.log('\n--- 2. Control de Acceso y Rutas Protegidas ---');
  const noAuthRes = await get('/api/productos');
  assert(noAuthRes.status === 401, 'Acceso a /api/productos sin JWT es rechazado con HTTP 401');

  // 3. Autenticación y Credenciales Inválidas
  console.log('\n--- 3. Autenticación (Login) ---');
  const badLoginRes = await post('/api/auth/login', { email: 'fake@despensa.com', password: 'wrong' });
  assert(badLoginRes.status === 401, 'Login con credenciales incorrectas rechazado con HTTP 401');

  const goodLoginRes = await post('/api/auth/login', { email: 'admin@despensaplus.com', password: 'admin123' });
  assert(goodLoginRes.status === 200, 'Login con admin@despensaplus.com exitoso con HTTP 200');
  const token = goodLoginRes.data?.token;
  assert(!!token, 'JWT generado y retornado en payload');

  // 4. Catálogo de Productos
  console.log('\n--- 4. Consulta de Catálogo ---');
  const prodRes = await get('/api/productos', token);
  assert(prodRes.status === 200, 'GET /api/productos autenticado responde HTTP 200');
  const productos = prodRes.data?.productos || [];
  assert(productos.length >= 12, `Catálogo cargado con ${productos.length} productos sembrados`);

  const arroz = productos.find(p => p.nombre.toLowerCase().includes('arroz'));
  assert(!!arroz, 'Producto "Arroz" encontrado en base de datos');
  const stockInicialArroz = Number(arroz.stock_actual);
  console.log(`  ℹ️ Stock actual de ${arroz.nombre}: ${stockInicialArroz} ${arroz.unidad}`);

  // 5. Registro de Donación Atómica (Aumento de Stock)
  console.log('\n--- 5. Transacción Atómica de Donación (Entradas) ---');
  const donationPayload = {
    donante: 'Test Automatizado QA',
    tipo_donante: 'Particular',
    observaciones: 'Prueba de integración de flujo',
    detalles: [
      {
        id_producto: arroz.id_producto,
        cantidad: 15.0,
        fecha_vencimiento: '2027-06-30'
      }
    ]
  };
  const donRes = await post('/api/donaciones', donationPayload, token);
  assert(donRes.status === 201, 'POST /api/donaciones procesado con éxito (HTTP 201 Created)');

  // 6. Verificación de Aumento en Stock
  console.log('\n--- 6. Verificación de Inventario Post-Donación ---');
  const stockRes = await get('/api/stock', token);
  assert(stockRes.status === 200, 'GET /api/stock responde HTTP 200');
  const stockList1 = stockRes.data?.stock || [];
  const arrozPostDon = stockList1.find(p => p.id_producto === arroz.id_producto);
  const stockEsperadoDon = stockInicialArroz + 15.0;
  assert(
    Number(arrozPostDon.stock_actual) === stockEsperadoDon,
    `Stock de Arroz actualizado correctamente: ${stockInicialArroz} -> ${stockEsperadoDon} ${arroz.unidad}`
  );

  // 7. Salida / Distribución - Protección de Sobregiro (Stock insuficiente)
  console.log('\n--- 7. Prevención de Sobregiro en Salidas ---');
  const overdrawPayload = {
    motivo: 'Vianda',
    observaciones: 'Intento de retiro excesivo',
    detalles: [
      {
        id_producto: arroz.id_producto,
        cantidad: 99999.0
      }
    ]
  };
  const overdrawRes = await post('/api/salidas', overdrawPayload, token);
  assert(
    overdrawRes.status === 400,
    `Salida que supera el stock disponible es rechazada con HTTP 400 (${overdrawRes.data?.error || overdrawRes.data?.message})`
  );

  // 8. Salida Válida (Descuento de Stock)
  console.log('\n--- 8. Transacción Atómica de Salida (Egresos) ---');
  const validSalidaPayload = {
    motivo: 'Vianda',
    observaciones: 'Distribución para 40 viandas del mediodía',
    detalles: [
      {
        id_producto: arroz.id_producto,
        cantidad: 5.0
      }
    ]
  };
  const salidaRes = await post('/api/salidas', validSalidaPayload, token);
  assert(salidaRes.status === 201, 'POST /api/salidas procesado con éxito (HTTP 201 Created)');

  // 9. Verificación de Descuento en Stock
  console.log('\n--- 9. Verificación de Inventario Post-Salida ---');
  const stockResFinal = await get('/api/stock', token);
  const stockList2 = stockResFinal.data?.stock || [];
  const arrozFinal = stockList2.find(p => p.id_producto === arroz.id_producto);
  const stockEsperadoFinal = stockEsperadoDon - 5.0;
  assert(
    Number(arrozFinal.stock_actual) === stockEsperadoFinal,
    `Stock de Arroz descontado con precisión: ${stockEsperadoDon} -> ${stockEsperadoFinal} ${arroz.unidad}`
  );

  // 10. Módulo de Alertas
  console.log('\n--- 10. Módulo de Alertas Automáticas ---');
  const alertasRes = await get('/api/alertas', token);
  assert(alertasRes.status === 200, 'GET /api/alertas responde HTTP 200');
  assert(Array.isArray(alertasRes.data?.stockBajo), 'Lista stockBajo generada correctamente');
  assert(Array.isArray(alertasRes.data?.proximosAVencer), 'Lista proximosAVencer generada correctamente');

  // 11. Módulo de Reportes e Historial de Movimientos
  console.log('\n--- 11. Módulo de Reportes y Trazabilidad Histórica ---');
  const repResumen = await get('/api/reportes/resumen', token);
  assert(repResumen.status === 200, 'GET /api/reportes/resumen responde HTTP 200');
  assert(Number(repResumen.data?.totalDonaciones) >= 1, 'Total de donaciones contabilizado');
  assert(Number(repResumen.data?.totalSalidas) >= 1, 'Total de salidas contabilizado');

  const repMovimientos = await get('/api/reportes/movimientos', token);
  assert(repMovimientos.status === 200, 'GET /api/reportes/movimientos responde HTTP 200');
  assert(repMovimientos.data?.movimientos?.length >= 2, 'Historial unificado contiene donaciones y salidas registradas');

  // 12. Módulo de Gestión de Usuarios y Control RBAC (OWASP A01)
  console.log('\n--- 12. Módulo de Gestión de Usuarios y Control RBAC ---');
  const usersRes = await get('/api/usuarios', token);
  assert(usersRes.status === 200, 'GET /api/usuarios como Admin responde HTTP 200');
  assert(Array.isArray(usersRes.data?.usuarios), 'Lista de usuarios obtenida');

  // Control RBAC: operador denegado con 403 Forbidden
  const opLogin = await post('/api/auth/login', { email: 'operador@despensaplus.com', password: 'admin123' });
  const opToken = opLogin.data?.token;
  const opForbidden = await get('/api/usuarios', opToken);
  assert(opForbidden.status === 403, 'Acceso a /api/usuarios como Operador es rechazado con HTTP 403 Forbidden');

  // Crear nuevo usuario
  const testEmail = `qa_test_${Date.now()}@despensaplus.com`;
  const newUserRes = await post('/api/usuarios', {
    nombre: 'Usuario Prueba QA',
    email: testEmail,
    password: 'password123',
    rol: 'operador'
  }, token);
  assert(newUserRes.status === 201, 'POST /api/usuarios crea nuevo usuario exitosamente (HTTP 201)');
  const newUserId = newUserRes.data?.usuario?.id_usuario;

  // Intento de duplicado
  const dupRes = await post('/api/usuarios', {
    nombre: 'Duplicado',
    email: testEmail,
    password: 'password123',
    rol: 'operador'
  }, token);
  assert(dupRes.status === 409, 'Intento de registrar email duplicado es rechazado con HTTP 409 Conflict');

  // Actualizar usuario
  const updateRes = await put(`/api/usuarios/${newUserId}`, {
    nombre: 'Usuario Prueba Modificado'
  }, token);
  assert(updateRes.status === 200, 'PUT /api/usuarios/:id actualiza usuario correctamente (HTTP 200)');

  // Salvaguarda: autoeliminación de cuenta admin en sesión
  const selfDelRes = await del(`/api/usuarios/${goodLoginRes.data?.usuario?.id_usuario}`, token);
  assert(selfDelRes.status === 400, 'Intento de autoeliminación de la propia cuenta admin es bloqueado con HTTP 400');

  // Eliminar usuario de prueba
  const delRes = await del(`/api/usuarios/${newUserId}`, token);
  assert(delRes.status === 200, 'DELETE /api/usuarios/:id elimina usuario de prueba con HTTP 200');

  // Resumen final
  console.log('\n========================================================');
  console.log(`📊 RESULTADOS QA: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ¡TODAS LAS PRUEBAS INTEGRALES PASARON CON ÉXITO AL 100%!');
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
