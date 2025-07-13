// Ce fichier est un exemple pour une fonction serverless (Vercel, Netlify, etc.)
// Il ne peut pas être exécuté directement avec un simple serveur http.

const ImageKit = require('imagekit');

// N'exposez JAMAIS votre clé privée côté client.
// Idéalement, utilisez des variables d'environnement pour ces clés.
const imagekit = new ImageKit({
    publicKey: "public_GsdYxjQC21Ltg6Yn3DIxNDAPwZ8=",
    privateKey: "private_93pE8T8UYsOcrc0qPBZy2cLkYLA=",
    urlEndpoint: "https://ik.imagekit.io/mvhberuj5"
});

// Exemple pour une fonction serverless type Vercel
module.exports = (req, res) => {
    // Permettre les requêtes depuis n'importe quelle origine (à restreindre en production)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        res.status(200).json(authenticationParameters);
    } catch (error) {
        console.error("Erreur lors de la génération des paramètres d'authentification:", error);
        res.status(500).json({ error: "Impossible de générer les paramètres d'authentification." });
    }
};
