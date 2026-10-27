# 🥫 Despensa+ | Sistema de Control de Donaciones y Stock

> **Proyecto de Práctica Profesionalizante IV — Sector 7G**  
> Desarrollado para el Comedor Comunitario *"Manos que Alimentan"*  
> Sistema web ágil y resiliente para el control de inventario, registro de donaciones, salidas de alimentos y trazabilidad de vencimientos.

---

## 🚀 1. Tecnologías Utilizadas

- **Frontend:** React 19, Vite, React Router DOM v7, Tailwind CSS + Stitch UI Design System (Figma tokens).
- **Backend:** Node.js (ES Modules), Express 4, `pg` (Pool de conexiones a PostgreSQL), `helmet` (Seguridad OWASP), `cors`, `bcryptjs`, `jsonwebtoken` (JWT).
- **Base de Datos:** PostgreSQL 15+ relacional con transacciones ACID (`BEGIN`, `COMMIT`, `ROLLBACK`), índices optimizados y restricciones de integridad.
- **Auditoría & Calidad:** Suite automatizada de pruebas end-to-end (QA E2E) con validación de prevención de sobregiro y reversión ante fallos.

---

## 🔑 2. Credenciales de Demostración

El sistema cuenta con un usuario administrador precargado para pruebas de voluntarias:

- **Email:** `admin@despensaplus.com`
- **Contraseña:** `admin123`
- **Rol:** `admin` (Administrador general del comedor)

*(En la pantalla de inicio de sesión `/login` se incluye un botón de **Autocompletar demo** para acceder en 1 solo clic).*

---

## 🛠️ 3. Puesta en Marcha Local

### Requisitos previos
- Node.js v18 o superior instalado.
- Servidor PostgreSQL activo localmente en el puerto `5432` con una base de datos creada llamada `despensaplus`.

### Paso 1: Configurar Variables de Entorno del Backend
Crear o verificar el archivo `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/despensaplus
JWT_SECRET=super_secreto_despensa_plus_jwt_key_2026
FRONTEND_URL=http://localhost:5173
```

### Paso 2: Inicializar la Base de Datos (Migraciones y Semillas)
En una terminal:
```bash
cd backend
npm install
npm run db:init
```
*Este comando crea las 6 tablas relacionales (`Usuario`, `Producto`, `Donacion`, `DetalleDonacion`, `Salida`, `DetalleSalida`) y siembra el lote completo de datos ficticios de prueba (3 usuarios, 16 productos, 7 donaciones y 7 salidas históricas con stock coherente para reportes). También puede ejecutar `npm run db:seed` para refrescar los datos sin alterar el esquema.*

### Paso 3: Iniciar el Servidor Backend
```bash
npm run dev
# El servidor iniciará en http://localhost:5000
```

### Paso 4: Iniciar la Aplicación Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
# La aplicación web estará disponible en http://localhost:5173
```

---

## 🧪 4. Ejecución de Pruebas de Calidad (QA)

Para verificar el cumplimiento del 100% de los requerimientos funcionales y no funcionales (Healthcheck, OWASP Helmet, Auth JWT, Catálogo, Donaciones atómicas, Stock en tiempo real, Bloqueo de sobregiro, Salidas, Alertas y Reportes):

```bash
# Con el backend corriendo en http://localhost:5000:
node tests/test_qa_suite.js
```

---

## 📋 5. Módulos y Rutas de la API REST

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/health` | Verificación de salud y cabeceras OWASP | Público |
| `POST` | `/api/auth/login` | Autenticación de voluntarias y emisión de JWT | Público |
| `GET` | `/api/productos` | Listado completo de alimentos e insumos | Autenticado |
| `POST` | `/api/productos` | Alta de nuevo producto en catálogo | Autenticado |
| `PUT` | `/api/productos/:id` | Modificación de producto existente | Autenticado |
| `GET` | `/api/stock` | Inventario consolidado con cálculo de lotes y días para vencimiento | Autenticado |
| `POST` | `/api/donaciones` | Registro atómico de donación con múltiples productos y vencimientos | Autenticado |
| `GET` | `/api/donaciones` | Listado histórico de donaciones recibidas | Autenticado |
| `POST` | `/api/salidas` | Registro atómico de egreso (viandas/meriendas) con validación de stock disponible | Autenticado |
| `GET` | `/api/salidas` | Listado histórico de salidas distribuidas | Autenticado |
| `GET` | `/api/alertas` | Detección automática de stock bajo ($\le$ mínimo) y próximos vencimientos | Autenticado |
| `GET` | `/api/reportes/resumen` | Métricas agregadas por período (total donaciones, salidas, saldo) | Autenticado |
| `GET` | `/api/reportes/movimientos` | Trazabilidad histórica completa unificada para rendición de cuentas | Autenticado |

---

## 🌐 6. Guía de Despliegue en la Nube

### Frontend (Vercel)
1. Conectar el repositorio de GitHub en Vercel.
2. Definir **Root Directory** como `frontend`.
3. Configurar variable de entorno `VITE_API_URL=https://tu-api.onrender.com`.
4. Vercel utilizará automáticamente `frontend/vercel.json` para gestionar el enrutamiento SPA sin errores 404.

### Backend & Base de Datos (Render / Supabase / Neon)
1. Crear una base de datos PostgreSQL administrada en **Supabase** o **Neon**.
2. Crear un Web Service en **Render** apuntando a la carpeta `backend` o usando el blueprint `backend/render.yaml`.
3. Configurar las variables de entorno en Render:
   - `DATABASE_URL`: URI de conexión a la base de datos PostgreSQL remota.
   - `JWT_SECRET`: Llave segura de firmado de tokens.
   - `FRONTEND_URL`: URL del frontend desplegado en Vercel.
4. En la consola de Render ejecutar una única vez: `npm run db:init` para sembrar el esquema y datos iniciales.

---

## 👥 Equipo de Desarrollo (Sector 7G)
- Práctica Profesionalizante IV — 2026
- Proyecto final aprobado y documentado bajo el ciclo estricto de desarrollo continuo.
