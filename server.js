const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fetch = require('node-fetch'); // necessário para chamadas à API do Facebook/Instagram

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const facebookAuthRoutes = require('./facebookAuth');
const uploadRoutes = require('./upload');

app.use(facebookAuthRoutes);
app.use(uploadRoutes);

// 🔗 Rota para publicar no Instagram via Graph API
app.post('/instagram/publish', async (req, res) => {
  const { accessToken, imageUrl, caption, pageId } = req.body;

  try {
    // 1. Buscar ID da conta Instagram vinculada à página
    const igAccountRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`);
    const igAccountData = await igAccountRes.json();

    const instagramId = igAccountData.instagram_business_account?.id;
    if (!instagramId) {
      return res.status(400).json({ error: 'Conta Instagram não vinculada a essa página.' });
    }

    // 2. Criar mídia no Instagram
    const mediaCreationRes = await fetch(`https://graph.facebook.com/v19.0/${instagramId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      })
    });

    const mediaData = await mediaCreationRes.json();
    if (!mediaData.id) {
      return res.status(400).json({ error: 'Erro ao criar mídia.', details: mediaData });
    }

    // 3. Publicar mídia
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${instagramId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: mediaData.id,
        access_token: accessToken
      })
    });

    const publishData = await publishRes.json();
    if (publishData.id) {
      return res.json({ success: true, postId: publishData.id });
    } else {
      return res.status(400).json({ error: 'Erro ao publicar mídia.', details: publishData });
    }
  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('API da Plataforma Multiupload rodando! 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
