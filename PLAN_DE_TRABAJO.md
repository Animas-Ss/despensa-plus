# Plan de Trabajo Detallado Día a Día: Proyecto Despensa+

Sistema de Control de Donaciones y Stock para Comedores Comunitarios (**Comedor "Manos que Alimentan"**).  
**Equipo:** Sector 7G (Sebastián Ricardo Sosa & Carlos Gez).

---

## 📌 Ficha Técnica

- **Frontend:** React + Tailwind CSS (Responsivo / Mobile-First).
- **Backend:** Node.js + Express (API REST).
- **Base de Datos:** PostgreSQL (`Usuario`, `Producto`, `Donacion`, `DetalleDonacion`, `Salida`, `DetalleSalida`).
- **Autenticación:** JWT + Bcrypt.
- **Hosting:** Vercel (Frontend) + Render / Supabase / Neon (Backend & BD).
- **Metodología:** Kanban + Git (Conventional Commits).

---

## 🗓️ Cronograma Día a Día (14 Días)

### 🧱 FASE 1: Entorno, Arquitectura Base y Base de Datos

#### **Día 1: Setup del Repositorio y Servidores Base**
- **Sebastián (Dev):** Setup de carpetas `/backend` y `/frontend`, Express con `cors`/`helmet`, Vite/React + Tailwind CSS.
- **Carlos (Gestión/QA):** Configurar tablero Kanban en GitHub Projects y plantilla `.env.example`.
- **Criterio de Aprobación:** `/api/health` respondiendo en puerto `5000` y React cargando en puerto `3000`.

#### **Día 2: Esquema PostgreSQL y Migraciones (DER)**
- **Sebastián (Dev):** Escribir DDL SQL con las 6 tablas (`Usuario`, `Producto`, `Donacion`, `DetalleDonacion`, `Salida`, `DetalleSalida`), PKs, FKs e índices.
- **Carlos (Gestión/QA):** Validar script `seed` con datos iniciales (categorías, unidades y usuario coordinador).
- **Criterio de Aprobación:** Script SQL ejecutado en PostgreSQL con relaciones verificadas.

---

### 🔐 FASE 2: Autenticación y Catálogo de Productos

#### **Día 3: Backend - Autenticación y Usuarios (RF01 / RNF01)**
- **Sebastián (Dev):** Endpoint `POST /api/auth/login` con bcrypt, JWT y middleware `authMiddleware`.
- **Carlos (Gestión/QA):** Pruebas de integración de login y rutas protegidas.
- **Criterio de Aprobación:** JWT válido generado y rutas sin token rechazadas con HTTP 401.

#### **Día 4: Backend - Catálogo de Productos (RF06)**
- **Sebastián (Dev):** Endpoints CRUD `GET /api/productos`, `POST /api/productos`, `PUT /api/productos/:id`.
- **Carlos (Gestión/QA):** Validar campos obligatorios (`nombre`, `categoría`, `unidad_medida`, `stock_minimo`).
- **Criterio de Aprobación:** Productos creados y editados correctamente en BD.

#### **Día 5: Frontend - Login y UI de Catálogo**
- **Sebastián (Dev):** Interfaz de Login, gestión de token en cliente y formulario modal para Catálogo de Productos.
- **Carlos (Gestión/QA):** Pruebas de accesibilidad y usabilidad desde vista móvil.
- **Criterio de Aprobación:** Redirección tras Login y creación de producto desde el navegador.

---

### 📦 FASE 3: Donaciones (Entradas) y Stock

#### **Día 6: Backend - Registro de Donaciones y Transacción de Stock (RF02)**
- **Sebastián (Dev):** Endpoint `POST /api/donaciones` con transacción SQL (`BEGIN`...`COMMIT`) para sumar stock en 1 operacion atómica.
- **Carlos (Gestión/QA):** Validar rollback en caso de error en detalle de donación.
- **Criterio de Aprobación:** Donación registrada e incremento automático de stock verificado.

#### **Día 7: Frontend - Formulario de Donación (RF02 / RNF03)**
- **Sebastián (Dev):** Formulario dinámico para agregar múltiples productos en la misma donación con fechas de vencimiento.
- **Carlos (Gestión/QA):** Validar que el proceso se complete en máximo 3-4 pasos desde celular.
- **Criterio de Aprobación:** Donación guardada exitosamente desde la UI.

#### **Día 8: Backend & Frontend - Consulta de Stock (RF03)**
- **Sebastián (Dev):** Endpoint `GET /api/stock` con filtros y vista de grilla/listado ordenado por vencimiento.
- **Carlos (Gestión/QA):** Validar indicación visual del vencimiento más próximo.
- **Criterio de Aprobación:** Grilla de stock filtrable y ordenada en tiempo real.

---

### 📤 FASE 4: Salidas (Distribución) y Alertas

#### **Día 9: Backend - Registro de Salidas / Distribución (RF04)**
- **Sebastián (Dev):** Endpoint `POST /api/salidas` con descuento de stock y actualización a estado `Agotado` cuando `stock = 0`.
- **Carlos (Gestión/QA):** Probar rechazo si la cantidad solicitada supera el stock disponible.
- **Criterio de Aprobación:** Egreso registrado y descuento de stock verificado.

#### **Día 10: Frontend - UI de Salidas y Transición de Estados**
- **Sebastián (Dev):** Vista de Salidas con selector de motivo (`Vianda`, `Merienda`) y cantidad.
- **Carlos (Gestión/QA):** Pruebas de usabilidad para voluntarias durante preparación de viandas.
- **Criterio de Aprobación:** Salida registrada desde la UI con actualización inmediata de stock.

#### **Día 11: Módulo de Alertas Automáticas (RF05)**
- **Sebastián (Dev):** Endpoint `GET /api/alertas` y componentes visuales para `Stock Bajo` y `Próximo a Vencer`.
- **Carlos (Gestión/QA):** Comprobar alertas contra el Diagrama de Estados (Figura 6 del documento).
- **Criterio de Aprobación:** Dashboard mostrando insignias destacadas en rojo/amarillo.

---

### 📈 FASE 5: Reportes, QA y Despliegue

#### **Día 12: Reportes e Historial (RF07 / RF08)**
- **Sebastián (Dev):** Endpoints y vista para resúmenes de movimientos por rango de fechas e historial por producto.
- **Carlos (Gestión/QA):** Verificar orden cronológico de entradas y salidas para rendición de cuentas.
- **Criterio de Aprobación:** Exportación/vista de reporte validada.

#### **Día 13: Pruebas Integrales, OWASP y Usabilidad**
- **Sebastián (Dev):** Optimización de carga ($<3$ segundos en 4G) y sanitización contra SQLi/XSS.
- **Carlos (Gestión/QA):** Ejecución de la lista de chequeo de pruebas con la referente del comedor.
- **Criterio de Aprobación:** 100% de casos de prueba aprobados.

#### **Día 14: Despliegue a Producción y Documentación**
- **Sebastián (Dev):** Deploy en Vercel (Frontend) y Render (Backend/PostgreSQL).
- **Carlos (Gestión/QA):** Redacción de guía rápida de uso e informe final.
- **Criterio de Aprobación:** URL pública funcional navegable sin errores.

---

## 🚦 Reglas de Git y Flujo de Trabajo

1. **Commits Convencionales:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
2. **Ramas por función:** `feature/<nombre-tarea>`.
3. **Revisión cruzada:** Pull Requests revisados por el otro integrante antes de fusionar a `main`.
