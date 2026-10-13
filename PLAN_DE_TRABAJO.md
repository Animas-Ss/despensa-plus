# Plan de Trabajo Detallado Día a Día: Proyecto Despensa+

**Sistema de Control de Donaciones y Stock para Comedores Comunitarios**  
**Organización Destino:** Comedor Comunitario *"Manos que Alimentan"* (Coordinadora: Laura Méndez)  
**Equipo de Desarrollo (Sector 7G):** Sebastián Ricardo Sosa (Dev/Tecnología) & Carlos Gez (Análisis/Gestión/QA)

---

## 📌 1. Ficha Técnica y Especificaciones Tecnológicas

- [x] **Arquitectura de Software:** Limpia y desacoplada en 3 capas (Presentación ↔ API REST ↔ Persistencia Relacional).
- [x] **Frontend Client:** React + Vite + Tailwind CSS (`@tailwindcss/vite`). Aplicación Web Responsiva Mobile-First.
- [x] **Backend API:** Node.js + Express (API REST modular con middlewares `cors`, `helmet`, `express.json()`).
- [x] **Base de Datos:** PostgreSQL relacional (Modelo de 6 tablas: `Usuario`, `Producto`, `Donacion`, `DetalleDonacion`, `Salida`, `DetalleSalida`).
- [x] **Autenticación & Seguridad:** JWT (cabecera `Authorization: Bearer`), cifrado Bcrypt/Argon2, OWASP Top 10.
- [x] **Infraestructura & Despliegue:** Vercel (Frontend) + Render / Supabase / Neon (Backend API + PostgreSQL).
- [x] **Metodología & Versionado:** Kanban continuo + Git con Commits Convencionales (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).

---

## 🗓️ 2. Cronograma Detallado y Checklist Día a Día (14 Días)

---

### 🧱 FASE 1: Entorno, Arquitectura Base y Base de Datos

#### **Día 1: Setup del Repositorio, Servidores Base y Verificación (COMPLETADO ✅)**
- [x] **Setup Inicial:** Estructura desacoplada creada en carpetas `/backend` y `/frontend`.
- [x] **Servidor Express:** Creado `backend/src/server.js` con middlewares `helmet`, `cors`, `express.json()`, puerto `5000` y endpoint `GET /api/health`.
- [x] **Plantilla de Entorno:** Archivo `backend/.env.example` con variables `PORT`, `DATABASE_URL`, `JWT_SECRET`.
- [x] **Setup Frontend:** Aplicación React + Vite en `/frontend` integrada con Tailwind CSS en `frontend/src/index.css` y `frontend/vite.config.js`.
- [x] **Interfaz Base:** Componente `frontend/src/App.jsx` con indicador visual de estado en tiempo real.
- [x] **Verificación Build:** Build de producción frontend ejecutado con `npm run build` (1.58s sin errores).
- [x] **Verificación Backend:** Servidor probado e iniciado correctamente en puerto 5000.
- [x] **Configuración Git:** `.gitignore` configurado manteniendo `.agents/`, `docs/` y `GEMINI.md` exclusivamente en el entorno local.
- [x] **Publicación GitHub:** Commit inicial y push enviado con éxito a la rama `main` de GitHub.

---

#### **Día 2: Esquema PostgreSQL, Migraciones SQL y Conexión de Persistencia (DER) (COMPLETADO ✅)**
- [x] **Módulo DB (`backend/src/config/db.js`):** Pool de conexiones a PostgreSQL con librería `pg`.
- [x] **Script DDL (`backend/src/db/schema.sql`):** Definición de las 6 tablas relacionales del DER:
  - [x] Tabla `Usuario`: `id_usuario SERIAL PK`, `nombre`, `email UNIQUE`, `password_hash`, `rol`, `fecha_creacion`.
  - [x] Tabla `Producto`: `id_producto SERIAL PK`, `nombre`, `categoria`, `unidad_medida`, `stock_actual`, `stock_minimo`, `estado`.
  - [x] Tabla `Donacion`: `id_donacion SERIAL PK`, `fecha`, `donante`, `observaciones`, `id_usuario FK`.
  - [x] Tabla `DetalleDonacion`: `id_detalle SERIAL PK`, `id_donacion FK`, `id_producto FK`, `cantidad CHECK(>0)`, `fecha_vencimiento`.
  - [x] Tabla `Salida`: `id_salida SERIAL PK`, `fecha`, `motivo` (Vianda/Merienda), `observaciones`, `id_usuario FK`.
  - [x] Tabla `DetalleSalida`: `id_detalle SERIAL PK`, `id_salida FK`, `id_producto FK`, `cantidad CHECK(>0)`.
- [x] **Script Seed (`backend/src/db/seed.sql`):** Datos iniciales (usuario administrador + 12 productos de ejemplo con categorías y unidades).
- [x] **Prueba de Persistencia (COMPLETADO ✅):**
  - [x] Base de datos PostgreSQL conectada localmente.
  - [x] Script `backend/src/db/initDb.js` (`npm run db:init`) ejecutado exitosamente: 6 tablas creadas y datos iniciales sembrados.
  - [x] Verificado `SELECT NOW()` y consulta de usuarios contra PostgreSQL en runtime.

---

### 🔐 FASE 2: Autenticación de Usuarios y Catálogo de Productos

#### **Día 3: Backend - Autenticación JWT y Usuarios (RF01 / RNF01) (COMPLETADO ✅)**
- [x] **Controller (`backend/src/controllers/authController.js`):** Métodos `login` con Bcrypt y `obtenerPerfil`.
- [x] **Middleware (`backend/src/middlewares/authMiddleware.js`):** Interceptor para verificar cabecera `Authorization: Bearer <token>`.
- [x] **Rutas (`backend/src/routes/authRoutes.js`):** Endpoints `POST /api/auth/login` y `GET /api/auth/me`.
- [x] **Pruebas de Autenticación (COMPLETADO ✅):** Validación empírica de login exitoso con HTTP 200 y emisión de JWT para `admin@despensaplus.com`.

---

#### **Día 4: Backend - Catálogo de Productos y Unidades (RF06) (COMPLETADO ✅)**
- [x] **Model (`backend/src/models/productoModel.js`):** Consultas SQL parametrizadas (`SELECT`, `INSERT`, `UPDATE`).
- [x] **Controller (`backend/src/controllers/productoController.js`):** Métodos `listarProductos`, `obtenerProducto`, `crearProducto`, `actualizarProducto`.
- [x] **Rutas (`backend/src/routes/productoRoutes.js`):** Endpoints protegidos `GET /api/productos`, `POST /api/productos`, `PUT /api/productos/:id`.
- [x] **Validaciones:** Comprobación de campos obligatorios, `stock_minimo >= 0` y unidades válidas (`kg`, `litros`, `unidades`, `paquetes`, `cajas`).
- [x] **Pruebas de Verificación:** Validación empírica contra API y base de datos de 401 (sin token), 200 (listado), 400 (unidad inválida), 201 (alta) y 200 (actualización).

---

#### **Día 5: Frontend - Pantalla de Login y Gestión de Catálogo UI (RF01 / RF06) (COMPLETADO ✅)**
- [x] **Cliente API (`frontend/src/services/api.js`):** Axios con interceptor de JWT token y redirección ante 401.
- [x] **Vista Login (`frontend/src/pages/Login.jsx`):** Formulario de acceso fiel al diseño Figma (`docs/Figma/Vistas/Despensa+ - Iniciar sesión.png`), con estados de carga, manejo de errores y botón de prueba rápida.
- [x] **Vista Catálogo / Stock (`frontend/src/pages/Productos.jsx`):** Tabla responsiva del catálogo de productos según Stitch UI (`docs/Figma/stitch_ui_view_generator/despensa_stock/`), búsqueda reactiva, filtro por categorías y filtro por nivel de stock.
- [x] **Componente Modal (`frontend/src/components/ModalProducto.jsx`):** Formulario modal para Alta/Edición de productos conectando en tiempo real con `POST /api/productos` y `PUT /api/productos/:id`.
- [x] **Navegación Lateral y Responsive (`frontend/src/components/Sidebar.jsx`):** Menú lateral idéntico a Figma Stitch UI con indicador activo amber, avatar de usuario y drawer para dispositivos móviles.
- [x] **Verificación E2E en Navegador:** Validación empírica completa con browser subagent de navegación, filtrado, alta y edición de producto con reflejo inmediato en PostgreSQL.

---

### 📦 FASE 3: Módulo de Registro de Donaciones (Entradas) y Stock

#### **Día 6: Backend - Registro de Donaciones y Transacción de Stock (RF02) (COMPLETADO ✅)**
- [x] **Model (`backend/src/models/donacionModel.js`):** Lógica de transacción SQL atómica (`BEGIN`, `INSERT Donacion`, iteración `INSERT DetalleDonacion`, `UPDATE Producto stock_actual`, `COMMIT`, `ROLLBACK`).
- [x] **Controller (`backend/src/controllers/donacionController.js`):** Validación estricta de payload (al menos 1 producto, cantidades $> 0$, fechas de vencimiento válidas, manejo de errores de negocio).
- [x] **Rutas (`backend/src/routes/donacionRoutes.js`):** Endpoints protegidos con JWT `POST /api/donaciones`, `GET /api/donaciones` y `GET /api/donaciones/:id`.
- [x] **Prueba Rollback y Persistencia:** Validación empírica certificando que un fallo en cualquier detalle revierte la transacción completa sin alterar stock, y que una donación válida actualiza el inventario en tiempo real.

---

#### **Día 7: Frontend - Formulario Ágil de Registro de Donación (RF02 / RNF03) (COMPLETADO ✅)**
- [x] **Vista Donaciones (`frontend/src/pages/RegistrarDonacion.jsx`):** Pantalla del flujo de entradas basada en Stitch UI (`docs/Figma/stitch_ui_view_generator/despensa_registrar_donaci_n/`).
- [x] **Filas Dinámicas y Auto-completado:** Tabla dinámica de productos donados, selector de catálogo, unidad automática en lectura, campos de cantidad y fechas de vencimiento.
- [x] **Usabilidad y Flujo Ágil:** Proceso de registro ágil en pocos clics, botón para registrar otra donación y botón para ir a stock.

---

#### **Día 8: Backend & Frontend - Consulta e Inventario de Stock (RF03) (COMPLETADO ✅)**
- [x] **Controller Stock (`backend/src/controllers/stockController.js`):** Consulta SQL enriquecida con `MIN(fecha_vencimiento)`, cálculo de días restantes y clasificaciones de stock.
- [x] **Rutas (`backend/src/routes/stockRoutes.js`):** Endpoint protegido `GET /api/stock`.
- [x] **Vista Stock (`frontend/src/pages/Productos.jsx`):** Tabla con columna de vencimiento, filtro rápido "Próximo a vencer", badges visuales y búsqueda por categoría.

---

### 📤 FASE 4: Registro de Salidas (Distribución) y Sistema de Alertas

#### **Día 9: Backend - Salidas / Distribución y Transición de Estados (RF04) (COMPLETADO ✅)**
- [x] **Model Salidas (`backend/src/models/salidaModel.js`):** Transacción SQL atómica (`BEGIN`, bloqueo `FOR UPDATE`, validación de `stock_actual >= cantidad`, `INSERT Salida`, `INSERT DetalleSalida`, `UPDATE Producto stock_actual`, `COMMIT`, `ROLLBACK`).
- [x] **Controller (`backend/src/controllers/salidaController.js`):** Validación de motivo (`Vianda`, `Merienda`, `Otro`), validación de stock disponible con mensaje de error claro (HTTP 400).
- [x] **Rutas (`backend/src/routes/salidaRoutes.js`):** Endpoints protegidos `POST /api/salidas`, `GET /api/salidas` y `GET /api/salidas/:id`.

---

#### **Día 10: Frontend - UI de Registro de Salidas y Distribución (RF04) (COMPLETADO ✅)**
- [x] **Vista Salidas (`frontend/src/pages/RegistrarSalida.jsx`):** Pantalla de egresos fiel a Figma Stitch UI (`docs/Figma/stitch_ui_view_generator/despensa_registrar_salida/`).
- [x] **Formulario Dinámico:** Selector de motivo (`Vianda`, `Merienda`, `Otro`), visualización de stock disponible en vivo por producto, validación de cantidad máxima permitida y reseteo en 1 clic.
- [x] **Navegación:** Ruta activa `/salidas` montada en `App.jsx` y vinculada al `Sidebar`.

---

#### **Día 11: Módulo de Alertas Automáticas de Stock y Vencimiento (RF05) (COMPLETADO ✅)**
- [x] **Controller Alertas (`backend/src/controllers/alertaController.js`):** Endpoint `GET /api/alertas` evaluando `Stock Bajo` ($stock\_actual \le stock\_minimo$) y `Próximo a Vencer` ($\le 30 \text{ días}$).
- [x] **Componente Alertas (`frontend/src/components/PanelAlertas.jsx`):** Insignias y tarjetas destacadas integradas en el Dashboard.
- [x] **Vista Dashboard (`frontend/src/pages/Dashboard.jsx`):** Resumen de stock y bloque de alertas urgentes en tiempo real.
- [x] **Vista Alertas (`frontend/src/pages/Alertas.jsx`):** Pantalla dedicada con tabs y desglose exhaustivo de productos en riesgo.

---

### 📈 FASE 5: Reportes, Historial, Pruebas Integrales y Despliegue

#### **Día 12: Reportes e Historial de Movimientos por Producto (RF07 / RF08) (COMPLETADO ✅)**
- [x] **Controller Reportes (`backend/src/controllers/reporteController.js`):** Endpoints `GET /api/reportes/resumen` y `GET /api/reportes/movimientos` con trazabilidad SQL completa (`Donaciones` + `Salidas`).
- [x] **Vista Reportes (`frontend/src/pages/Reportes.jsx`):** Resumen por período, métricas consolidadas, filtros por rango temporal y tipo de movimiento, y funcionalidad de impresión para rendición de cuentas (`window.print()`).

---

#### **Día 13: Pruebas Integrales, OWASP Security Audit y Optimización 4G (RNF01-RNF06) (COMPLETADO ✅)**
- [x] **Seguridad OWASP:** Cabeceras Helmet (`nosniff`, `SAMEORIGIN`), sanitización SQL parametrizado, control de acceso JWT y variables de entorno protegidas.
- [x] **Rendimiento (RNF04):** Code splitting con `React.lazy` y `<Suspense>` generando chunks livianos de 5 a 18 kB para carga $<1.5$ segundos en redes 4G.
- [x] **Suite QA (`backend/tests/test_qa_suite.cjs`):** 25 pruebas automatizadas completas cubriendo el flujo de voluntarias, prevención de sobregiro y consistencia de datos (`npm test`).

---

#### **Día 14: Despliegue a Producción en Vercel/Render y Entrega Final (COMPLETADO ✅)**
- [x] **Configuración Frontend (Vercel):** Archivo `frontend/vercel.json` con reglas de rewrite para navegación SPA sin errores 404.
- [x] **Configuración Backend (Render):** Blueprint `backend/render.yaml` para despliegue automatizado con PostgreSQL.
- [x] **Documentación de Cierre:** Manual de usuario para voluntarias en `docs/MANUAL_DE_USUARIO.md` y guía técnica integral en `README.md`.

---

## 🚦 3. Reglas de Git y Flujo de Aprobación

- [x] **Ramas por Funcionalidad:** Crear ramas secundarias `feature/<nombre-tarea>`.
- [x] **Revisión Cruzada:** Pull Request revisado por el compañero antes de fusionar a `main`.
- [x] **Commits Convencionales:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
