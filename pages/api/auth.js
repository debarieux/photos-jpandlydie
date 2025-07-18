import ImageKit from "imagekit";

// Configuration d'ImageKit avec vérification des variables d'environnement
if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
  console.error("Erreur: Variables d'environnement ImageKit manquantes");
  console.log("Variables actuelles:", {
    PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY ? 'Définie' : 'Manquante',
    PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY ? 'Définie' : 'Manquante',
    URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT ? 'Défini' : 'Manquant'
  });
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  authenticationEndpoint: '/api/auth'
});

// Fonction pour gérer les requêtes OPTIONS (prévol)
const allowCors = (handler) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V,Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await handler(req, res);
};

const handler = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log("Tentative de génération des paramètres d'authentification...");
    const authenticationParameters = imagekit.getAuthenticationParameters();
    console.log("Paramètres générés avec succès");
    return res.status(200).json(authenticationParameters);
  } catch (error) {
    console.error("Erreur lors de la génération des paramètres d'authentification:", error);
    return res.status(500).json({ 
      error: "Impossible de générer les paramètres d'authentification.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default allowCors(handler);
