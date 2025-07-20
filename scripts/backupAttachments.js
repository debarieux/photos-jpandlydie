const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify', 
  'https://www.googleapis.com/auth/drive'
];

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    return getNewToken(oAuth2Client);
  }
}

async function processEmails() {
  const auth = await authorize();
  const gmail = google.gmail({version: 'v1', auth});
  const drive = google.drive({version: 'v3', auth});

  // Récupérer les emails avec pièces jointes
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'has:attachment subject:"Nouvelles photos du mariage"',
    maxResults: 50
  });

  for (const message of res.data.messages || []) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'full'
    });

    // Traiter les pièces jointes
    for (const part of msg.data.payload.parts || []) {
      if (part.filename) {
        const attachment = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: message.id,
          id: part.body.attachmentId
        });

        // Sauvegarder dans Drive
        await drive.files.create({
          requestBody: {
            name: part.filename,
            parents: ['1ABC123'] // ID du dossier Drive
          },
          media: {
            mimeType: part.mimeType,
            body: Buffer.from(attachment.data.data, 'base64')
          }
        });
      }
    }

    // Archiver l'email
    await gmail.users.messages.trash({userId: 'me', id: message.id});
  }
}

processEmails().catch(console.error);
