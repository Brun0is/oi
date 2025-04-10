const express = require("express");
const multer = require("multer");
const cors = require("cors");
const admin = require("./firebase-admin");

const upload = multer({ dest: "uploads/" });
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let uploadCounts = {}; // { uid: { count: X, lastDate: 'YYYY-MM-DD' } }

function canUpload(uid) {
  const today = new Date().toISOString().split("T")[0];
  if (!uploadCounts[uid] || uploadCounts[uid].lastDate !== today) {
    uploadCounts[uid] = { count: 0, lastDate: today };
  }
  return uploadCounts[uid].count < 3;
}

function recordUpload(uid) {
  uploadCounts[uid].count++;
}

app.post("/upload", upload.single("video"), async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) return res.status(401).json({ error: "Token ausente." });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    if (!canUpload(uid)) {
      return res.status(403).json({ error: "Limite diário atingido." });
    }

    // 👉 Aqui você faz o upload do vídeo no YouTube...
    // Supondo que deu certo:
    recordUpload(uid);

    res.status(200).json({ message: "Vídeo enviado com sucesso!" });
  } catch (err) {
    console.error("Erro de autenticação:", err);
    res.status(401).json({ error: "Token inválido." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});