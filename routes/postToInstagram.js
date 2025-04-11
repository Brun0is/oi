const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

// Exemplo: POST /instagram/publish
router.post('/instagram/publish', async (req, res) => {
  const { accessToken, imageUrl, caption, pageId } = req.body;

  try {
    // 1. Obter ID da conta Instagram conectada à página do Facebook
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

module.exports = router;
