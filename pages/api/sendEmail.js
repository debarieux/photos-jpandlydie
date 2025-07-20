import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { files } = req.body;

    if (!files || !files.length) {
      return res.status(400).json({ error: 'Aucun fichier à envoyer' });
    }

    // Configuration du transporteur Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // Préparer les pièces jointes
    const attachments = files.map(file => ({
      filename: file.name,
      content: Buffer.from(file.base64.replace(/^data:.+;base64,/, ''), 'base64'),
      contentType: file.type,
    }));

    // Options de l'email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Envoyer à soi-même
      subject: 'Nouvelles photos du mariage',
      text: 'Vous avez reçu de nouvelles photos du mariage.',
      attachments,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des photos:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi des photos',
      details: error.message 
    });
  }
}
