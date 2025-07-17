const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3002;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.txt': 'text/plain'
};

// Fonction pour servir les fichiers statiques
function serveStaticFile(res, filePath, contentType, responseCode = 200) {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Fichier non trouvé
                if (fs.existsSync(path.join(__dirname, '404.html'))) {
                    serveStaticFile(res, path.join(__dirname, '404.html'), 'text/html', 404);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found', 'utf-8');
                }
            } else {
                // Erreur du serveur
                res.writeHead(500);
                res.end(`Désolé, une erreur est survenue : ${error.code}`);
            }
        } else {
            // En-têtes de sécurité
            const securityHeaders = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https://ik.imagekit.io; connect-src 'self' https://ik.imagekit.io https://mariage-photos-ppke.vercel.app/api;"
            };
            
            // Définir le type de contenu et les en-têtes
            const headers = {
                'Content-Type': contentType,
                ...securityHeaders
            };
            
            // Si c'est un fichier JavaScript, ajouter l'en-tête CORS
            if (contentType.includes('javascript')) {
                headers['Access-Control-Allow-Origin'] = '*';
            }
            
            // Envoyer la réponse
            res.writeHead(responseCode, headers);
            res.end(content, 'utf-8');
        }
    });
}

// Création du serveur
const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Analyser l'URL
    const parsedUrl = url.parse(req.url, true);
    let pathname = path.normalize(parsedUrl.pathname).replace(/^(?:\/|\\)+/, '');
    
    // Gérer la racine comme index.html
    if (pathname === '' || pathname === '/') {
        pathname = 'index.html';
    }
    
    // Déterminer le chemin du fichier
    let filePath = path.join(__dirname, pathname);
    
    // Vérifier si le fichier existe
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Si le fichier n'existe pas, essayer avec l'extension .html
            if (!path.extname(filePath)) {
                filePath += '.html';
                fs.stat(filePath, (err, stats) => {
                    if (err || !stats.isFile()) {
                        // Fichier non trouvé
                        serveStaticFile(res, path.join(__dirname, '404.html'), 'text/html', 404);
                    } else {
                        // Servir le fichier avec extension .html
                        const extname = path.extname(filePath);
                        const contentType = MIME_TYPES[extname] || 'application/octet-stream';
                        serveStaticFile(res, filePath, contentType);
                    }
                });
            } else {
                // Fichier non trouvé
                serveStaticFile(res, path.join(__dirname, '404.html'), 'text/html', 404);
            }
        } else {
            // Le fichier existe, le servir
            const extname = path.extname(filePath);
            const contentType = MIME_TYPES[extname] || 'application/octet-stream';
            serveStaticFile(res, filePath, contentType);
        }
    });
});

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}/`);
    console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
});
