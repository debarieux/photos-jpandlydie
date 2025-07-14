const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log('Requête reçue pour :', req.url);
    
    // Gérer la racine comme index.html
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Obtenir l'extension du fichier
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Lire le fichier
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code === 'ENOENT') {
                // Fichier non trouvé
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('404 Not Found', 'utf-8');
                });
            } else {
                // Erreur du serveur
                res.writeHead(500);
                res.end('Désolé, une erreur est survenue : '+error.code+' ..\n');
            }
        } else {
            // Succès, renvoyer le contenu du fichier
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}/`);
});
