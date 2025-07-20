import nodemailer from 'nodemailer';

// Configuration simple et robuste
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Configuration pour les gros fichiers
export const config = {
  api: {
    bodyParser: false, // Désactive le parsing automatique
    responseLimit: '20mb',
    externalResolver: true
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    const { files, senderName, senderEmail } = await new Promise((resolve, reject) => {
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON body'));
        }
      });
      req.on('error', reject);
    });

    // Validation basique mais essentielle
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Aucun fichier valide fourni');
    }

    // Préparation des pièces jointes avec vérification de taille
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB max
    let totalSize = 0;

    const attachments = await Promise.all(files.map(async (file) => {
      if (!file.base64) {
        throw new Error('Format de fichier non supporté');
      }

      const base64Data = file.base64.replace(/^data:.+;base64,/, '');
      const fileSize = Buffer.byteLength(base64Data, 'base64');
      totalSize += fileSize;

      if (totalSize > MAX_SIZE) {
        throw new Error(`Taille totale des fichiers dépasse ${MAX_SIZE/1024/1024}MB`);
      }

      return {
        filename: file.name || `photo-${Date.now()}.jpg`,
        content: base64Data,
        encoding: 'base64'
      };
    }));

    // Configuration de l'email
    const mailOptions = {
      from: `"${senderName || 'Mariage'}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: senderName ? `Photos de ${senderName}` : 'Nouvelles photos du mariage',
      text: senderEmail ? `Envoyé par: ${senderEmail}` : 'Nouvelles photos reçues',
      attachments
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Erreur:', error);
    return res.status(500).json({ 
      error: error.message || 'Échec de l\'envoi'
    });
  }
}
