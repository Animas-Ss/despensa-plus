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

#### **Día 2: Esquema PostgreSQL, Migraciones SQL y Conexión de Persistencia (DER)**
- [ ] **Módulo DB (`backend/src/config/db.js`):** Crear pool de conexiones a PostgreSQL con librería `pg`.
- [ ] **Script DDL (`backend/src/db/schema.sql`):** Definición de las 6 tablas relacionales del DER:
  - [ ] Tabla `Usuario`: `id_usuario SERIAL PK`, `nombre`, `email UNIQUE`, `password_hash`, `rol`, `fecha_creacion`.
  - [ ] Tabla `Producto`: `id_producto SERIAL PK`, `nombre`, `categoria`, `unidad_medida`, `stock_actual`, `stock_minimo`, `estado`.
  - [ ] Tabla `Donacion`: `id_donacion SERIAL PK`, `fecha`, `donante`, `observaciones`, `id_usuario FK`.
  - [ ] Tabla `DetalleDonacion`: `id_detalle SERIAL PK`, `id_donacion FK`, `id_producto FK`, `cantidad CHECK(>0)`, `fecha_vencimiento`.
  - [ ] Tabla `Salida`: `id_salida SERIAL PK`, `fecha`, `motivo` (Vianda/Merienda), `observaciones`, `id_usuario FK`.
  - [ ] Tabla `DetalleSalida`: `id_detalle SERIAL PK`, `id_salida FK`, `id_producto FK`, `cantidad CHECK(>0)`.
- [ ] **Script Seed (`backend/src/db/seed.sql`):** Datos iniciales (usuario administrador inicial, categorías y unidades de medida).
- [ ] **Prueba de Persistencia:** Ejecución del script DDL y verificación de consulta `SELECT NOW()`.

---

### 🔐 FASE 2: Autenticación de Usuarios y Catálogo de Productos

#### **Día 3: Backend - Autenticación JWT y Usuarios (RF01 / RNF01)**
- [ ] **Controller (`backend/src/controllers/authController.js`):** Métodos `login` con Bcrypt y `obtenerPerfil`.
- [ ] **Middleware (`backend/src/middlewares/authMiddleware.js`):** Interceptor para verificar cabecera `Authorization: Bearer <token>`.
- [ ] **Rutas (`backend/src/routes/authRoutes.js`):** Endpoints `POST /api/auth/login` y `GET /api/auth/me`.
- [ ] **Pruebas de Seguridad:** Validación de rechazo HTTP 401 Unauthorized para peticiones no autenticadas.

---

#### **Día 4: Backend - Catálogo de Productos y Unidades (RF06)**
- [ ] **Model (`backend/src/models/productoModel.js`):** Consultas SQL parametrizadas (`SELECT`, `INSERT`, `UPDATE`).
- [ ] **Controller (`backend/src/controllers/productoController.js`):** Métodos `listarProductos`, `obtenerProducto`, `crearProducto`, `actualizarProducto`.
- [ ] **Rutas (`backend/src/routes/productoRoutes.js`):** Endpoints protegidos `GET /api/productos`, `POST /api/productos`, `PUT /api/productos/:id`.
- [ ] **Validaciones:** Comprobación de campos obligatorios, `stock_minimo >= 0` y unidades válidas (`kg`, `litros`, `unidades`, `paquetes`).

---

#### **Día 5: Frontend - Pantalla de Login y Gestión de Catálogo UI (RF01 / RF06)**
- [ ] **Cliente API (`frontend/src/services/api.js`):** Axios/Fetch con interceptor de JWT token.
- [ ] **Vista Login (`frontend/src/pages/Login.jsx`):** Formulario de acceso con estados de carga y manejo de errores.
- [ ] **Vista Catálogo (`frontend/src/pages/Productos.jsx`):** Tabla responsiva del catálogo de productos.
- [ ] **Componente Modal (`frontend/src/components/ModalProducto.jsx`):** Formulario modal para Alta/Edición de productos.
- [ ] **Barra de Navegación (`frontend/src/components/Navbar.jsx`):** Header con datos de sesión y botón de Logout.

---

### 📦 FASE 3: Módulo de Registro de Donaciones (Entradas) y Stock

#### **Día 6: Backend - Registro de Donaciones y Transacción de Stock (RF02)**
- [ ] **Model (`backend/src/models/donacionModel.js`):** Lógica de transacción SQL (`BEGIN`, `INSERT Donacion`, `INSERT DetalleDonacion`, `UPDATE Producto stock_actual`).
- [ ] **Controller (`backend/src/controllers/donacionController.js`):** Validación de payload con al menos 1 producto y cantidad $> 0$.
- [ ] **Rutas (`backend/src/routes/donacionRoutes.js`):** Endpoints `POST /api/donaciones` y `GET /api/donaciones`.
- [ ] **Prueba Rollback:** Certificar que un fallo en detalle revierta toda la donación sin alterar stock.

---

#### **Día 7: Frontend - Formulario Ágil de Registro de Donación (RF02 / RNF03)**
- [ ] **Vista Donaciones (`frontend/src/pages/RegistrarDonacion.jsx`):** Pantalla del flujo de entradas.
- [ ] **Componente Formulario (`frontend/src/components/FormularioDonacion.jsx`):** Filas dinámicas de productos, cantidades y fechas de vencimiento.
- [ ] **Usabilidad Móvil:** Proceso de registro en máximo 3-4 clics con reseteo de formulario en 1-clic.

---

#### **Día 8: Backend & Frontend - Consulta e Inventario de Stock (RF03)**
- [ ] **Controller Stock (`backend/src/controllers/stockController.js`):** Consulta SQL con `MIN(fecha_vencimiento)` por producto.
- [ ] **Rutas (`backend/src/routes/stockRoutes.js`):** Endpoint `GET /api/stock`.
- [ ] **Vista Stock (`frontend/src/pages/Stock.jsx`):** Grilla responsiva con buscador por nombre, filtro por categoría y badges de estado.

---

### 📤 FASE 4: Registro de Salidas (Distribución) y Sistema de Alertas

#### **Día 9: Backend - Salidas / Distribución y Transición de Estados (RF04 / Diagrama de Estados)**
- [ ] **Model Salidas (`backend/src/models/salidaModel.js`):** Transacción SQL (`BEGIN`, verificación `stock_actual >= cantidad`, `INSERT Salida`, `INSERT DetalleSalida`, `UPDATE Producto stock_actual`, actualizar estado a `Agotado` si llega a 0).
- [ ] **Controller (`backend/src/controllers/salidaController.js`):** Validación de stock disponible (HTTP 400 Bad Request si no alcanza).
- [ ] **Rutas (`backend/src/routes/salidaRoutes.js`):** Endpoints `POST /api/salidas` y `GET /api/salidas`.

---

#### **Día 10: Frontend - UI de Registro de Salidas y Distribución (RF04)**
- [ ] **Vista Salidas (`frontend/src/pages/RegistrarSalida.jsx`):** Pantalla de egresos.
- [ ] **Componente Formulario (`frontend/src/components/FormularioSalida.jsx`):** Selector de motivo (`Vianda`, `Merienda`, `Otro`) y comprobación de stock disponible en vivo.

---

#### **Día 11: Módulo de Alertas Automáticas de Stock y Vencimiento (RF05)**
- [ ] **Controller Alertas (`backend/src/controllers/alertaController.js`):** Endpoint `GET /api/alertas` evaluando `Stock Bajo` ($stock\_actual \le stock\_minimo$) y `Próximo a Vencer` ($\le 7 \text{ días}$).
- [ ] **Componente Alertas (`frontend/src/components/PanelAlertas.jsx`):** Insignias y tarjetas destacadas en el Dashboard.
- [ ] **Vista Dashboard (`frontend/src/pages/Dashboard.jsx`):** Resumen general de stock y alertas urgentes.

---

### 📈 FASE 5: Reportes, Historial, Pruebas Integrales y Despliegue

#### **Día 12: Reportes e Historial de Movimientos por Producto (RF07 / RF08)**
- [ ] **Controller Reportes (`backend/src/controllers/reporteController.js`):** Endpoints `GET /api/reportes/movimientos` e `GET /api/productos/:id/historial`.
- [ ] **Vista Reportes (`frontend/src/pages/Reportes.jsx`):** Resumen por período con opción de impresión para rendición de cuentas.
- [ ] **Vista Historial (`frontend/src/pages/HistorialProducto.jsx`):** Listado cronológico de movimientos por producto.

---

#### **Día 13: Pruebas Integrales, OWASP Security Audit y Optimización 4G (RNF01-RNF06)**
- [ ] **Seguridad OWASP:** Sanitización de entradas, cabeceras Helmet y protección de secretos.
- [ ] **Rendimiento (RNF04):** Code splitting en React para asegurar carga $<3$ segundos en red móbile 4G.
- [ ] **Suite QA:** Pruebas de aceptación completas del flujo de voluntarias.

---

#### **Día 14: Despliegue a Producción en Vercel/Render y Entrega Final**
- [ ] **Despliegue Frontend:** Publicación en Vercel (`https://despensa-plus.vercel.app`).
- [ ] **Despliegue Backend:** API REST y PostgreSQL publicadas en Render/Supabase/Neon.
- [ ] **Documentación Cierre:** Guía rápida de uso para voluntarias e informe final de la Práctica Profesionalizante IV.

---

## 🚦 3. Reglas de Git y Flujo de Aprobación

- [x] **Ramas por Funcionalidad:** Crear ramas secundarias `feature/<nombre-tarea>`.
- [x] **Revisión Cruzada:** Pull Request revisado por el compañero antes de fusionar a `main`.
- [x] **Commits Convencionales:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
