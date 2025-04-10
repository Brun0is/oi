// routes/facebookAuth.js
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

/**
 * ROTA: /auth/facebook/callback
 * Essa rota é chamada automaticamente pelo Facebook após o usuário autorizar o login
 */
router.get('/auth/facebook/callback', async (req, res) => {
  // Passo 1: Captura o código recebido na URL
  const code = req.query.code;

  // Passo 2: Define as credenciais e a URL de redirecionamento
  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = 'https://https://backend-youtube-etta.onrender.com'; // MESMA URL que você usou no botão de login

  try {
    // Passo 3: Solicita ao Facebook o access_token usando o código
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`
    );

    const tokenData = await tokenResponse.json();

    // Passo 4: Verifica se recebeu o access_token corretamente
    if (!tokenData.access_token) {
      console.error("Erro ao obter token:", tokenData);
      return res.status(400).json({ error: "Token não recebido." });
    }

    const accessToken = tokenData.access_token;

    // Passo 5: Aqui você pode salvar o access_token no banco de dados, associado ao usuário logado
    // Exemplo (pseudo): await salvarTokenFacebook(uid, accessToken);

    // Passo 6: Finaliza informando sucesso (ou redireciona para o painel)
    return res.send("✅ Facebook conectado com sucesso. Pode fechar esta aba.");
  } catch (error) {
    console.error("Erro no login com Facebook:", error);
    return res.status(500).json({ error: "Erro interno ao conectar com o Facebook." });
  }
});

module.exports = router;
