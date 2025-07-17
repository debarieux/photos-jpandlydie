// --- Configuration ImageKit.io ---
const publicKey = window.ENV?.IMAGEKIT_PUBLIC_KEY || "public_GsdYxjQC21Ltg6Yn3DIxNDAPwZ8=";
const urlEndpoint = window.ENV?.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/mvhberuj5";
// L'URL de l'API d'authentification est définie côté serveur
const authenticationEndpoint = window.ENV?.AUTH_ENDPOINT || 'https://photos-jpandlydie.vercel.app/api/auth';

// --- DOM Elements ---
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileSelectBtn = document.getElementById('file-select-btn');
    const uploadForm = document.getElementById('upload-form');
    const fileListContainer = document.getElementById('file-list');
    const confirmationMessage = document.getElementById('confirmation-message');

    if (!dropZone || !fileInput || !fileSelectBtn || !uploadForm) {
        console.error("Un ou plusieurs éléments du DOM n'ont pas été trouvés.");
        return;
    }

    // --- Event Listeners ---

    // Ouvre le sélecteur de fichiers au clic sur le bouton
    fileSelectBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Ouvre le sélecteur de fichiers au clic sur la drop zone
    dropZone.addEventListener('click', (e) => {
        // Empêche le déclenchement si on clique sur le bouton à l'intérieur
        if (e.target !== fileSelectBtn && !fileSelectBtn.contains(e.target)) {
            fileInput.click();
        }
    });

    // Gère le changement de l'input de fichier (sélection manuelle)
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFiles(fileInput.files);
        }
    });

    // --- Drag and Drop Events ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drop-zone--over');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropZone.addEventListener(type, () => {
            dropZone.classList.remove('drop-zone--over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drop-zone--over');
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files; // Assigne les fichiers à l'input
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // Gère la soumission du formulaire
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const files = fileInput.files;
        if (files.length > 0) {
            uploadFiles(files);
        }
    });

    // --- Functions ---

    function handleFiles(files) {
        fileListContainer.innerHTML = ''; // Vide la liste précédente
        if (files.length === 0) return;

        const fileList = document.createElement('ul');
        fileList.className = 'list-disc list-inside text-gray-600';

        Array.from(files).forEach(file => {
            const listItem = document.createElement('li');
            listItem.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            fileList.appendChild(listItem);
        });

        fileListContainer.appendChild(fileList);
        
        // Simule l'upload directement après la sélection
        // Dans un cas réel, on pourrait attendre un clic sur un bouton "Envoyer"
        uploadFiles(files);
    }

    async function uploadFiles(files) {
        console.log("Début de l'upload de", files.length, "fichiers vers ImageKit.io.");
        console.log("Endpoint d'authentification:", authenticationEndpoint);
        console.log("Clé publique:", publicKey ? 'Définie' : 'Non définie');

        fileListContainer.innerHTML += `<div class="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div id="progress-bar" class="bg-orange-500 h-2.5 rounded-full" style="width: 0%"></div>
        </div>`;
        const progressBar = document.getElementById('progress-bar');

        try {
            // 1. Obtenir la signature du backend
            console.log("Tentative de connexion à l'API d'authentification...");
            const authResponse = await fetch(authenticationEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log("Réponse de l'API d'authentification:", {
                status: authResponse.status,
                statusText: authResponse.statusText,
                ok: authResponse.ok
            });

            if (!authResponse.ok) {
                const errorText = await authResponse.text();
                console.error("Erreur complète de l'API:", errorText);
                throw new Error(`Erreur d'authentification (${authResponse.status}): ${authResponse.statusText}`);
            }

            const authData = await authResponse.json();
            console.log("Données d'authentification reçues:", authData);
            
            const { signature, expire, token } = authData;
            if (!signature || !expire || !token) {
                throw new Error("Données d'authentification incomplètes");
            }

            const filesArray = Array.from(files);
            let totalUploaded = 0;

            // Uploader chaque fichier individuellement
            for (const file of filesArray) {
                console.log("Préparation de l'upload du fichier:", file.name, "(taille:", file.size, "octets)");
                
                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileName', `mariage-jp-lydie/${Date.now()}-${file.name}`); // Dossier spécifique
                formData.append('useUniqueFileName', 'true');
                formData.append('publicKey', publicKey);
                formData.append('signature', signature);
                formData.append('expire', expire);
                formData.append('token', token);

                console.log("Envoi du fichier vers ImageKit...");
                const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    body: formData
                });

                const responseData = await uploadResponse.json();
                console.log("Réponse d'ImageKit:", responseData);

                if (!uploadResponse.ok) {
                    console.error(`Erreur lors de l'upload de ${file.name}:`, responseData);
                    continue; // Passe au fichier suivant en cas d'erreur
                }

                totalUploaded++;
                // Mettre à jour la barre de progression
                const progress = (totalUploaded / filesArray.length) * 100;
                progressBar.style.width = `${progress}%`;
            }

            if (totalUploaded === filesArray.length) {
                console.log("Tous les fichiers ont été envoyés avec succès !");
                showConfirmation();
            } else {
                alert(`Seulement ${totalUploaded} sur ${filesArray.length} fichiers ont pu être envoyés. Veuillez réessayer les autres.`);
            }

        } catch (error) {
            console.error("Une erreur majeure est survenue lors de l'upload:", error);
            alert("Impossible de contacter le serveur d'authentification. L'upload ne peut pas commencer.");
            fileListContainer.innerHTML = ''; // Nettoyer la barre de progression
        }
    }

    function showConfirmation() {
        uploadForm.classList.add('hidden');
        confirmationMessage.classList.remove('hidden');
    }
});
