const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const facebookAuthRoutes = require('./facebookAuth'); // ou './routes/facebookAuth' se estiver dentro da pasta
const uploadRoutes = require('./upload');

app.use(facebookAuthRoutes);
app.use(uploadRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API da Plataforma Multiupload rodando! 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
