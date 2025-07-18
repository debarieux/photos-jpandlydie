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

export default function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate authentication parameters
    const authParams = imagekit.getAuthenticationParameters();
    
    // Log the authentication parameters (remove in production)
    console.log('Generated auth params:', authParams);
    
    // Set CORS headers for the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    // Return the authentication parameters
    return res.status(200).json(authParams);
    
  } catch (error) {
    console.error('Error generating authentication parameters:', error);
    
    // Set CORS headers for error response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({ 
      error: 'Failed to generate authentication parameters',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
