// Ce fichier est un exemple pour une fonction serverless (Vercel, Netlify, etc.)
// Il ne peut pas être exécuté directement avec un simple serveur http.

const ImageKit = require('imagekit');

// N'exposez JAMAIS votre clé privée côté client.
// Idéalement, utilisez des variables d'environnement pour ces clés.
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Configuration CORS sécurisée
const allowedOrigins = [
    'https://photos-jpandlydie.vercel.app',
    'https://mariage-photos-ppke.vercel.app',
    'http://localhost:3002'
];

// Exemple pour une fonction serverless type Vercel
module.exports = (req, res) => {
    // Vérifier l'origine de la requête
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    // En-têtes de sécurité
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 heures
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https://ik.imagekit.io; connect-src 'self' https://ik.imagekit.io;");

    // Répondre immédiatement aux requêtes OPTIONS (prévol)
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        res.status(200).json(authenticationParameters);
    } catch (error) {
        console.error("Erreur lors de la génération des paramètres d'authentification:", error);
        res.status(500).json({ error: "Impossible de générer les paramètres d'authentification." });
    }
};
