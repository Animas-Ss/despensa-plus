# Plan de Trabajo Detallado Día a Día: Proyecto Despensa+

**Sistema de Control de Donaciones y Stock para Comedores Comunitarios**  
**Organización Destino:** Comedor Comunitario *"Manos que Alimentan"* (Coordinadora: Laura Méndez)  
**Equipo de Desarrollo (Sector 7G):** Sebastián Ricardo Sosa (Dev/Tecnología) & Carlos Gez (Análisis/Gestión/QA)

---

## 📌 1. Ficha Técnica y Especificaciones Tecnológicas

- **Arquitectura de Software:** Limpia y desacoplada en 3 capas (Presentación ↔ API REST ↔ Persistencia Relacional).
- **Frontend Client:** React + Vite + Tailwind CSS (`@tailwindcss/vite`). Aplicación Web Responsiva Mobile-First (optimizada para celular y PC sin instalación).
- **Backend API:** Node.js + Express (API REST modular con middlewares de seguridad `cors`, `helmet`, `express.json()`).
- **Base de Datos:** PostgreSQL relacional (Modelo de 6 tablas: `Usuario`, `Producto`, `Donacion`, `DetalleDonacion`, `Salida`, `DetalleSalida`).
- **Autenticación & Seguridad:** JWT (JSON Web Tokens en cabecera `Authorization: Bearer`), cifrado de contraseñas con Bcrypt / Argon2, sanitización de entradas contra SQLi y XSS (OWASP Top 10).
- **Infraestructura & Despliegue:** Vercel (Frontend) + Render / Supabase / Neon (Backend API + PostgreSQL).
- **Metodología & Versionado:** Kanban continuo + Git con Commits Convencionales (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).

---

## 🗓️ 2. Cronograma Detallado y Registro Día a Día (14 Días)

---

### 🧱 FASE 1: Entorno, Arquitectura Base y Base de Datos

#### **Día 1: Setup del Repositorio, Servidores Base y Verificación (COMPLETADO ✅)**
- **Estado:** Finalizado y verificado el 08/10/2026.
- **Acciones Ejecutadas:**
  1. Inicialización de la estructura desacoplada en `/backend` y `/frontend`.
  2. **Backend Express:** Creado [`backend/src/server.js`](file:///c:/Users/Usuario/Desktop/despensa-plus/backend/src/server.js) con middlewares `helmet`, `cors`, `express.json()`, puerto `5000` y endpoint de salud `GET /api/health`.
  3. **Backend Config:** Plantilla [`backend/.env.example`](file:///c:/Users/Usuario/Desktop/despensa-plus/backend/.env.example) con variables `PORT`, `DATABASE_URL`, `JWT_SECRET`.
  4. **Frontend React + Vite:** Creada app en `/frontend` integrada con Tailwind CSS en [`frontend/src/index.css`](file:///c:/Users/Usuario/Desktop/despensa-plus/frontend/src/index.css) y [`frontend/vite.config.js`](file:///c:/Users/Usuario/Desktop/despensa-plus/frontend/vite.config.js).
  5. **Frontend UI:** Creado componente [`frontend/src/App.jsx`](file:///c:/Users/Usuario/Desktop/despensa-plus/frontend/src/App.jsx) que conecta en tiempo real con el health check del backend.
  6. **Verificaciones:**
     - Build de producción frontend ejecutado con `npm run build` (Finalizado en 1.58s sin errores).
     - Servidor backend probado e iniciado correctamente en puerto 5000.
     - `.gitignore` configurado manteniendo `.agents/`, `docs/` y `GEMINI.md` exclusivamente en el entorno local.
     - Commit inicial y push enviado con éxito a la rama `main` de GitHub.

---

#### **Día 2: Esquema PostgreSQL, Migraciones SQL y Conexión de Persistencia (DER)**
- **Objetivo Principal:** Implementar las 6 tablas relacionales del DER en PostgreSQL y crear el módulo de conexión del backend.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `backend/src/config/db.js`: Módulo de conexión a PostgreSQL mediante `pg` (Pool de conexiones).
    - `backend/src/db/schema.sql`: Script DDL completo con las tablas:
      1. `Usuario`: `id_usuario SERIAL PRIMARY KEY`, `nombre VARCHAR(100)`, `email VARCHAR(150) UNIQUE`, `password_hash VARCHAR(255)`, `rol VARCHAR(50)`, `fecha_creacion TIMESTAMP`.
      2. `Producto`: `id_producto SERIAL PRIMARY KEY`, `nombre VARCHAR(100)`, `categoria VARCHAR(50)`, `unidad_medida VARCHAR(20)`, `stock_actual INT DEFAULT 0`, `stock_minimo INT DEFAULT 0`, `estado VARCHAR(30)`.
      3. `Donacion`: `id_donacion SERIAL PRIMARY KEY`, `fecha DATE NOT NULL`, `donante VARCHAR(150)`, `observaciones TEXT`, `id_usuario INT REFERENCES Usuario(id_usuario)`.
      4. `DetalleDonacion`: `id_detalle SERIAL PRIMARY KEY`, `id_donacion INT REFERENCES Donacion(id_donacion) ON DELETE CASCADE`, `id_producto INT REFERENCES Producto(id_producto)`, `cantidad INT NOT NULL CHECK (cantidad > 0)`, `fecha_vencimiento DATE`.
      5. `Salida`: `id_salida SERIAL PRIMARY KEY`, `fecha DATE NOT NULL`, `motivo VARCHAR(100)` (Vianda/Merienda), `observaciones TEXT`, `id_usuario INT REFERENCES Usuario(id_usuario)`.
      6. `DetalleSalida`: `id_detalle SERIAL PRIMARY KEY`, `id_salida INT REFERENCES Salida(id_salida) ON DELETE CASCADE`, `id_producto INT REFERENCES Producto(id_producto)`, `cantidad INT NOT NULL CHECK (cantidad > 0)`.
    - `backend/src/db/seed.sql`: Script de datos iniciales (Usuario administrador inicial, categorías como *Legumbres*, *Lácteos*, *Enlatados*, y unidades como *kg*, *litros*, *unidades*).
- **Asignación de Roles:**
  - **Sebastián (Dev):** Redacción del script SQL DDL, restricciones `CHECK`, índices de búsqueda y módulo de pool `db.js`.
  - **Carlos (Gestión/QA):** Validación de coincidencia del script SQL contra el DER del documento de diseño (Figura 2).
- **Criterio de Aprobación:** Script SQL ejecutado en PostgreSQL sin errores y prueba de consulta `SELECT NOW()` respondiendo en `db.js`.

---

### 🔐 FASE 2: Autenticación de Usuarios y Catálogo de Productos

#### **Día 3: Backend - Autenticación JWT y Usuarios (RF01 / RNF01)**
- **Objetivo Principal:** Implementar la lógica de inicio de sesión con Bcrypt y generación/verificación de tokens JWT.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear/Modificar:**
    - `backend/src/controllers/authController.js`: Métodos `login(req, res)` (comparación de password con `bcrypt.compare`) y `obtenerPerfil(req, res)`.
    - `backend/src/middlewares/authMiddleware.js`: Interceptor que extrae el token del header `Authorization: Bearer <token>`, lo verifica con `jwt.verify` y adjunta `req.usuario` a la petición.
    - `backend/src/routes/authRoutes.js`: Definición de endpoints `POST /api/auth/login` y `GET /api/auth/me`.
    - `backend/src/server.js`: Registrar las rutas en `/api/auth`.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Hashing de passwords, firma de tokens JWT expirables en 24h y middleware de autenticación.
  - **Carlos (Gestión/QA):** Casos de prueba en Postman/Jest para credenciales válidas, clave incorrecta y petición sin token (debe retornar HTTP 401 Unauthorized).
- **Criterio de Aprobación:** Token JWT generado correctamente tras login exitoso y rutas protegidas rechazando peticiones no autenticadas.

---

#### **Día 4: Backend - Catálogo de Productos y Unidades (RF06)**
- **Objetivo Principal:** Crear el CRUD completo del catálogo de productos con validaciones de entrada.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `backend/src/models/productoModel.js`: Consultas SQL (`SELECT * FROM Producto`, `INSERT INTO Producto`, `UPDATE Producto`).
    - `backend/src/controllers/productoController.js`: Manejadores `listarProductos`, `obtenerProducto`, `crearProducto`, `actualizarProducto`.
    - `backend/src/routes/productoRoutes.js`: Endpoints protegidos `GET /api/productos`, `POST /api/productos`, `PUT /api/productos/:id`.
  - **Validaciones Integradas:** Sanitización de textos, `stock_minimo >= 0`, `unidad_medida` dentro de valores permitidos (`kg`, `litros`, `paquetes`, `unidades`, `latas`).
- **Asignación de Roles:**
  - **Sebastián (Dev):** Construcción de consultas SQL seguras con parámetros numerados (`$1, $2`) para evitar SQL Injection.
  - **Carlos (Gestión/QA):** Verificación de esquemas de validación de campos obligatorios.
- **Criterio de Aprobación:** Alta y edición de productos operando correctamente en la base de datos a través de la API.

---

#### **Día 5: Frontend - Pantalla de Login y Gestión de Catálogo UI (RF01 / RF06)**
- **Objetivo Principal:** Construir las interfaces de inicio de sesión y administración del catálogo responsivas.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `frontend/src/services/api.js`: Instancia de cliente HTTP (Axios/Fetch) con interceptores para inyectar automáticamente el token JWT almacenado.
    - `frontend/src/pages/Login.jsx`: Formulario de acceso con manejo de estados de carga, mensajes de error visuales y redirección al Dashboard.
    - `frontend/src/pages/Productos.jsx`: Lista y tabla responsiva del catálogo de productos.
    - `frontend/src/components/ModalProducto.jsx`: Formulario modal para crear y editar productos.
    - `frontend/src/components/Navbar.jsx`: Barra de navegación con botón de cierre de sesión.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Programación de vistas React, gestión de estado local/Context API para la sesión y modals.
  - **Carlos (Gestión/QA):** Pruebas de usabilidad en vista móvil (Chrome Mobile devtools) comprobando botones táctiles amplios para voluntarias.
- **Criterio de Aprobación:** Iniciar sesión en la app web y dar de alta un producto nuevo reflejándose de inmediato en la tabla.

---

### 📦 FASE 3: Módulo de Registro de Donaciones (Entradas) y Stock

#### **Día 6: Backend - Registro de Donaciones y Transacción de Stock (RF02)**
- **Objetivo Principal:** Endpoint de registro de donaciones con actualización atómica de stock mediante transacciones SQL.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `backend/src/models/donacionModel.js`: Lógica SQL con transacción `BEGIN`, `INSERT INTO Donacion`, `INSERT INTO DetalleDonacion`, y `UPDATE Producto SET stock_actual = stock_actual + $1 WHERE id_producto = $2`.
    - `backend/src/controllers/donacionController.js`: Controller `registrarDonacion(req, res)` que valida que la donación contenga al menos 1 producto con cantidad $> 0$.
    - `backend/src/routes/donacionRoutes.js`: Endpoint `POST /api/donaciones` y `GET /api/donaciones`.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Implementación de la transacción SQL atómica (`BEGIN ... COMMIT / ROLLBACK`) para garantizar que si falla un ítem, no se altere el stock.
  - **Carlos (Gestión/QA):** Prueba de fallo forzado para certificar el Rollback transaccional (Fiabilidad RNF05).
- **Criterio de Aprobación:** Registro de donación incrementando automáticamente el stock de los productos incluidos.

---

#### **Día 7: Frontend - Formulario Ágil de Registro de Donación (RF02 / RNF03)**
- **Objetivo Principal:** Formulario interactivo y ágil para el ingreso de productos donados desde teléfonos móviles.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `frontend/src/pages/RegistrarDonacion.jsx`: Pantalla principal del flujo de entrada.
    - `frontend/src/components/FormularioDonacion.jsx`: Formulario dinámico que permite agregar múltiples filas de productos (selector de producto, cantidad, fecha de vencimiento).
  - **UX/Usabilidad:** Botón de "Confirmar Donación" con feedback inmediato (alerta verde) y reseteo del formulario en 1-clic.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Estado dinámico de array de ítems en React y envío de payload JSON al backend.
  - **Carlos (Gestión/QA):** Medición de tiempo y clics para registrar una donación (máximo 3-4 clics desde la pantalla principal).
- **Criterio de Aprobación:** Registrar una donación de 3 productos desde la web y verificar el aumento de stock en el catálogo.

---

#### **Día 8: Backend & Frontend - Consulta e Inventario de Stock (RF03)**
- **Objetivo Principal:** Pantalla de consulta de stock actual por producto indicando la fecha de vencimiento más próxima.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `backend/src/controllers/stockController.js`: Consulta SQL que une `Producto` con `DetalleDonacion` obteniendo `MIN(fecha_vencimiento)` por cada producto con stock disponible.
    - `backend/src/routes/stockRoutes.js`: Endpoint `GET /api/stock`.
    - `frontend/src/pages/Stock.jsx`: Vista de inventario con buscador por nombre, filtro por categoría y badges de colores por estado.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Query SQL optimizada con `LEFT JOIN` y `GROUP BY` y componente de tabla/cards de stock.
  - **Carlos (Gestión/QA):** Verificación de ordenamiento de fechas de vencimiento más urgentes al inicio del listado.
- **Criterio de Aprobación:** Inventario de stock cargando en pantalla con cantidades exactas y fechas de vencimiento calculadas.

---

### 📤 FASE 4: Registro de Salidas (Distribución) y Sistema de Alertas

#### **Día 9: Backend - Salidas / Distribución y Transición de Estados (RF04 / Diagrama de Estados)**
- **Objetivo Principal:** Endpoint de egreso de productos con descuento de stock y actualización de estado a `Agotado`.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `backend/src/models/salidaModel.js`: Lógica SQL transaccional (`BEGIN`, verificar `stock_actual >= cantidad`, `INSERT INTO Salida`, `INSERT INTO DetalleSalida`, `UPDATE Producto SET stock_actual = stock_actual - $1`, si `stock_actual = 0` actualizar `estado = 'Agotado'`, `COMMIT`).
    - `backend/src/controllers/salidaController.js`: Controller `registrarSalida(req, res)` con validación de stock disponible antes de ejecutar la transacción.
    - `backend/src/routes/salidaRoutes.js`: Endpoints `POST /api/salidas` y `GET /api/salidas`.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Validación de stock suficiente en servidor (lanzar HTTP 400 Bad Request si la cantidad a retirar supera la disponible).
  - **Carlos (Gestión/QA):** Probar el cambio automático de estado a `Agotado` según el Diagrama de Estados (Figura 6).
- **Criterio de Aprobación:** Descuento de stock en salidas y rechazo de retiros que superen la existencia disponible.

---

#### **Día 10: Frontend - UI de Registro de Salidas y Distribución (RF04)**
- **Objetivo Principal:** Pantalla de registro de salidas de alimentos para viandas o meriendas.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `frontend/src/pages/RegistrarSalida.jsx`: Pantalla de egresos.
    - `frontend/src/components/FormularioSalida.jsx`: Formulario con selector de motivo (`Armado de Viandas`, `Merienda`, `Otro`), fecha y lista de productos con indicador en vivo de la cantidad disponible.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Validación en el cliente para impedir seleccionar cantidades mayores al stock en existencia.
  - **Carlos (Gestión/QA):** Pruebas de usabilidad para voluntarias durante el armado de viandas.
- **Criterio de Aprobación:** Registrar la salida de un producto y comprobar que su stock disminuya de inmediato en la UI.

---

#### **Día 11: Módulo de Alertas Automáticas de Stock y Vencimiento (RF05)**
- **Objetivo Principal:** Dashboard con sistema de alertas visuales en tiempo real para stock mínimo y productos próximos a vencer.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `backend/src/controllers/alertaController.js`: Endpoint `GET /api/alertas` que evalúa:
      1. **Alerta de Stock Bajo:** `stock_actual <= stock_minimo` (Insignia Amarilla/Roja).
      2. **Alerta de Vencimiento Próximo:** `fecha_vencimiento <= CURRENT_DATE + 7 dias` (Insignia Naranja).
    - `frontend/src/components/PanelAlertas.jsx`: Componente destacado en la parte superior del Dashboard.
    - `frontend/src/pages/Dashboard.jsx`: Panel principal con tarjetas resumidas (Total Donaciones, Productos en Stock Bajo, Productos por Vencer).
- **Asignación de Roles:**
  - **Sebastián (Dev):** Cálculo de fechas en SQL y renderizado de componentes de alerta en el Dashboard.
  - **Carlos (Gestión/QA):** Comprobar que un producto al caer por debajo de su stock mínimo active la alerta de inmediato.
- **Criterio de Aprobación:** Dashboard mostrando las alertas activas con código de colores claro y accionable.

---

### 📈 FASE 5: Reportes, Historial, Pruebas Integrales y Despliegue

#### **Día 12: Reportes e Historial de Movimientos por Producto (RF07 / RF08)**
- **Objetivo Principal:** Pantalla de reportes de entradas/salidas por período e historial de trazabilidad por producto.
- **Detalle Técnico por Tareas:**
  - **Archivos a Crear:**
    - `backend/src/controllers/reporteController.js`: Endpoints `GET /api/reportes/movimientos?desde=...&hasta=...` y `GET /api/productos/:id/historial`.
    - `frontend/src/pages/Reportes.jsx`: Vista con resúmenes por fechas y opción de impresión/exportación para rendición de cuentas a donantes.
    - `frontend/src/pages/HistorialProducto.jsx`: Vista cronológica de todas las donaciones y salidas de un producto específico.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Queries SQL agregadas con `SUM()` y `COUNT()` agrupadas por rango de fechas.
  - **Carlos (Gestión/QA):** Verificación de la exactitud de las cifras reportadas contra las donaciones y salidas cargadas.
- **Criterio de Aprobación:** Reporte generado mostrando totales consolidados de donaciones y salidas por período.

---

#### **Día 13: Pruebas Integrales, OWASP Security Audit y Optimización 4G (RNF01-RNF06)**
- **Objetivo Principal:** Auditoría completa de seguridad, optimización de velocidad de carga y suite de pruebas final.
- **Detalle Técnico por Tareas:**
  - **Tareas de Seguridad:**
    - Verificar sanitización de inputs y prevención de XSS con Helmet e inspeccionar respuestas para evitar fuga de stack traces en producción.
    - Validar que no existan credenciales hardcodeadas (uso exclusivo de `.env`).
  - **Tareas de Rendimiento (RNF04):**
    - Code splitting y lazy loading en React para asegurar que el Bundle cargue en $< 3$ segundos bajo red 4G móbile.
  - **Lista de Chequeo QA:**
    - Ejecutar suite de pruebas de aceptación basadas en la entrevista con la coordinadora Laura Méndez.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Optimización de assets, minificación y parches de seguridad OWASP.
  - **Carlos (Gestión/QA):** Ejecución de la matriz de pruebas integrales y emisión del informe de QA.
- **Criterio de Aprobación:** 100% de los casos de uso (RF01 a RF08) ejecutados y aprobados sin errores de consola ni de servidor.

---

#### **Día 14: Despliegue a Producción en Vercel/Render y Entrega Final**
- **Objetivo Principal:** Publicar la solución en producción (Vercel + Render/PostgreSQL) y entregar la documentación.
- **Detalle Técnico por Tareas:**
  - **Despliegue:**
    - Frontend publicado en Vercel (`https://despensa-plus.vercel.app`).
    - API REST publicada en Render/Supabase con variables de entorno de producción configuradas.
    - Ejecución de migraciones `schema.sql` y `seed.sql` en la BD de producción.
  - **Cierre del Proyecto:**
    - Redacción de la Guía Rápida de Uso para voluntarias del comedor.
    - Presentación del informe de cierre de la Práctica Profesionalizante IV.
- **Asignación de Roles:**
  - **Sebastián (Dev):** Configuración de variables de entorno en paneles Vercel/Render y pruebas de comunicación HTTPS.
  - **Carlos (Gestión/QA):** Elaboración de la guía de usuario final y acta de entrega.
- **Criterio de Aprobación:** Aplicación web pública totalmente operativa en producción respondiendo desde celulares y computadoras.

---

## 🚦 3. Reglas de Git y Flujo de Aprobación para el Equipo

1. **Ramas por Funcionalidad:** Cada tarea se desarrolla en ramas descriptivas (`feature/auth-jwt`, `feature/donaciones-sql`, `feature/alertas-ui`).
2. **Revisión Cruzada Obligatoria:** Un Pull Request (PR) requiere la revisión del otro integrante antes de integrarse a la rama `main`.
3. **Commits Convencionales:** Usar prefijos estándar (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
