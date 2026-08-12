import app from './app';

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
  console.log(`Prueba el endpoint de estado en: http://localhost:${PORT}/api/status`);
});
