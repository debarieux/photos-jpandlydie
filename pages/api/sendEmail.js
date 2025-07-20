import nodemailer from 'nodemailer';

// Configuration simple et robuste
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { files, senderName, senderEmail } = req.body;

    // Validation basique mais essentielle
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Aucun fichier valide fourni');
    }

    // Préparation des pièces jointes
    const attachments = await Promise.all(files.map(async (file) => {
      if (!file.base64 && !file.file) {
        throw new Error('Fichier invalide: données manquantes');
      }
      
      if (!file.base64) {
        throw new Error('Seules les données base64 sont acceptées côté serveur');
      }
      const base64Data = file.base64.replace(/^data:.+;base64,/, '');

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
