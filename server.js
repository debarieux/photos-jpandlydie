const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir les fichiers statiques du répertoire actuel
app.use(express.static(__dirname));

// Toutes les requêtes GET renvoient vers index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
