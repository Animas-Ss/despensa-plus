import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de seguridad y parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Endpoint de verificación de salud (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API REST Despensa+ funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Middleware de manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor Despensa+ API REST`);
  console.log(`🌐 Escuchando en http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);
});
