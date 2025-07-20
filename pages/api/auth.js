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
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/mvhberuj5',
});

// Configuration des en-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export default function handler(req, res) {
  // Gestion des requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
  }

  // Seules les requêtes GET sont autorisées
  if (req.method !== 'GET') {
    return res
      .status(405)
      .setHeader('Allow', ['GET', 'OPTIONS'])
      .json({ 
        error: 'Method not allowed',
        allowedMethods: ['GET', 'OPTIONS'] 
      });
  }

  try {
    // Vérification des variables d'environnement
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error('Erreur: Clés ImageKit manquantes dans les variables d\'environnement');
      return res.status(500).json({ 
        error: 'Configuration serveur incomplète',
        details: 'Les clés API ImageKit ne sont pas configurées correctement.'
      });
    }

    // Génération des paramètres d'authentification
    const authParams = imagekit.getAuthenticationParameters({
      token: process.env.IMAGEKIT_TOKEN,
      expire: process.env.IMAGEKIT_TOKEN_EXPIRE || (Math.floor(Date.now() / 1000) + 3600) // 1 heure d'expiration par défaut
    });
    
    console.log('Paramètres d\'authentification générés avec succès');
    
    // Retour des paramètres avec les en-têtes CORS
    return res
      .status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Content-Type', 'application/json')
      .json(authParams);
      
  } catch (error) {
    console.error('Erreur lors de la génération des paramètres d\'authentification:', {
      message: error.message,
      stack: error.stack
    });
    
    return res
      .status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Content-Type', 'application/json')
      .json({
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
  }
}
