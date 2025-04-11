const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

/**
 * ROTA: /auth/facebook/callback
 */
router.get('/auth/facebook/callback', async (req, res) => {
  const code = req.query.code;

  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = 'https://SEU_BACKEND.com/auth/facebook/callback';

  try {
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Erro ao obter token:", tokenData);
      return res.status(400).json({ error: "Token não recebido." });
    }

    const accessToken = tokenData.access_token;

    // Aqui você pode salvar o token no banco, associado ao usuário

    return res.send("✅ Facebook conectado com sucesso. Pode fechar esta aba.");
  } catch (error) {
    console.error("Erro no login com Facebook:", error);
    return res.status(500).json({ error: "Erro interno ao conectar com o Facebook." });
  }
});

module.exports = router;
