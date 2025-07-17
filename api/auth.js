const ImageKit = require('imagekit');

// Configuration d'ImageKit avec les variables d'environnement
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Liste des origines autorisées (CORS)
const allowedOrigins = [
    'https://photos-jpandlydie.vercel.app',
    'https://mariage-photos-ppke.vercel.app',
    'http://localhost:3002'
];

// Gestionnaire principal de la requête
module.exports = async (req, res) => {
    // Configuration des en-têtes CORS
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    // Gestion des requêtes OPTIONS (prévol)
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400'); // Mise en cache pour 24h
        return res.status(204).end();
    }

    // Seules les requêtes GET sont autorisées
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // Générer les paramètres d'authentification
        const authParams = imagekit.getAuthenticationParameters();
        return res.status(200).json(authParams);
    } catch (error) {
        console.error('Erreur lors de la génération des paramètres d\'authentification:', error);
        return res.status(500).json({ 
            error: 'Erreur serveur lors de la génération des paramètres d\'authentification',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
