// Configuration d'ImageKit.io
const PUBLIC_KEY = "public_GsdYxjQC21Ltg6Yn3DIxNDAPwZ8=";
const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const FOLDER_NAME = 'mariage-jp-lydie';

// Attente du chargement complet du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Récupération des éléments du DOM
    const elements = {
        dropZone: document.getElementById('drop-zone'),
        fileInput: document.getElementById('file-input'),
        fileSelectBtn: document.getElementById('file-select-btn'),
        fileListContainer: document.getElementById('file-list'),
        progressContainer: document.getElementById('progress-container'),
        progressBar: document.getElementById('progress-bar'),
        progressText: document.getElementById('progress-text'),
        confirmationMessage: document.getElementById('confirmation-message')
    };

    // Vérification des éléments requis
    if (Object.values(elements).some(el => !el)) {
        console.error("Certains éléments du DOM sont manquants.");
        return;
    }

    // Initialisation des écouteurs d'événements
    function initEventListeners() {
        // Gestion du clic sur le bouton de sélection
        elements.fileSelectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.fileInput.click();
        });

        // Gestion de la sélection de fichiers
        elements.fileInput.addEventListener('change', () => {
            if (elements.fileInput.files.length > 0) {
                handleFiles(elements.fileInput.files);
            }
        });

        // Gestion du glisser-déposer
        initDragAndDrop();
    }

    // Configuration du glisser-déposer
    function initDragAndDrop() {
        const { dropZone } = elements;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#d35400';
            dropZone.style.transform = 'translateY(-3px)';
            dropZone.style.boxShadow = '0 15px 30px rgba(230, 126, 34, 0.2)';
        });

        ['dragleave', 'dragend'].forEach(type => {
            dropZone.addEventListener(type, () => {
                dropZone.style.borderColor = '#e67e22';
                dropZone.style.transform = 'translateY(0)';
                dropZone.style.boxShadow = '0 10px 25px rgba(230, 126, 34, 0.15)';
            });
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#e67e22';
            dropZone.style.transform = 'translateY(0)';
            dropZone.style.boxShadow = '0 10px 25px rgba(230, 126, 34, 0.15)';
            
            if (e.dataTransfer.files.length > 0) {
                elements.fileInput.files = e.dataTransfer.files;
                handleFiles(e.dataTransfer.files);
            }
        });
    }

    // Affiche la liste des fichiers sélectionnés
    function handleFiles(files) {
        elements.fileListContainer.innerHTML = '';
        if (files.length === 0) return;

        const fileList = document.createElement('div');
        fileList.className = 'space-y-4';

        Array.from(files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300';
            fileItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 truncate" title="${file.name}">${file.name}</p>
                        <p class="text-xs text-gray-500">${formatFileSize(file.size)}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden mr-4">
                        <div id="file-progress-${index}" class="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <span id="progress-text-${index}" class="text-xs font-medium text-gray-500 w-10 text-right">0%</span>
                </div>
            `;
            fileList.appendChild(fileItem);
        });

        elements.fileListContainer.appendChild(fileList);
        elements.progressContainer.classList.remove('hidden');
        uploadFiles(files); // Lance automatiquement l'upload
    }

    // Formatage de la taille des fichiers
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Téléverse les fichiers vers ImageKit
    async function uploadFiles(files) {
        const filesArray = Array.from(files);
        let totalUploaded = 0;
        let totalSize = filesArray.reduce((acc, file) => acc + file.size, 0);
        let uploadedSize = 0;

        // Affiche la barre de progression
        elements.progressBar.style.width = '0%';
        elements.progressText.textContent = '0%';

        try {
            for (const [index, file] of filesArray.entries()) {
                console.log(`Traitement du fichier ${index + 1}/${filesArray.length}: ${file.name}`);
                
                const formData = createFormData(file);
                await uploadFile(formData, index, (loaded, total) => {
                    // Mise à jour de la progression pour ce fichier
                    const fileProgress = Math.round((loaded / total) * 100);
                    const fileProgressBar = document.getElementById(`file-progress-${index}`);
                    const fileProgressText = document.getElementById(`progress-text-${index}`);
                    
                    if (fileProgressBar) fileProgressBar.style.width = `${fileProgress}%`;
                    if (fileProgressText) fileProgressText.textContent = `${fileProgress}%`;
                    
                    // Mise à jour de la progression globale
                    uploadedSize = filesArray
                        .slice(0, index)
                        .reduce((acc, _, i) => acc + filesArray[i].size, 0) + loaded;
                    
                    const globalProgress = Math.round((uploadedSize / totalSize) * 100);
                    updateProgress(globalProgress);
                });
                
                // Met à jour la progression pour les fichiers terminés
                totalUploaded++;
                updateProgress(Math.round((totalUploaded / filesArray.length) * 100));
            }

            // Affiche le message de confirmation
            showConfirmation();
            
        } catch (error) {
            console.error("Erreur lors de l'upload:", error);
            showError(error.message);
        }
    }

    // Crée un objet FormData pour l'upload
    function createFormData(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `${FOLDER_NAME}/${Date.now()}-${file.name}`);
        formData.append('useUniqueFileName', 'true');
        formData.append('publicKey', PUBLIC_KEY);
        return formData;
    }

    // Effectue l'upload d'un fichier
    function uploadFile(formData, fileIndex, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    onProgress(event.loaded, event.total);
                }
            };
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    const error = new Error('Échec de l\'upload');
                    error.response = xhr.responseText;
                    reject(error);
                }
            };
            
            xhr.onerror = () => {
                reject(new Error('Erreur réseau lors de l\'upload'));
            };
            
            xhr.open('POST', UPLOAD_URL, true);
            xhr.send(formData);
        });
    }

    // Met à jour la barre de progression globale
    function updateProgress(progress) {
        elements.progressBar.style.width = `${progress}%`;
        elements.progressText.textContent = `${progress}%`;
        
        // Animation de la barre de progression
        if (progress === 100) {
            elements.progressBar.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                elements.progressBar.style.borderTopRightRadius = '0.5rem';
                elements.progressBar.style.borderBottomRightRadius = '0.5rem';
            }, 500);
        } else {
            elements.progressBar.style.borderTopRightRadius = '0';
            elements.progressBar.style.borderBottomRightRadius = '0';
        }
    }

    // Affiche le message de confirmation
    function showConfirmation() {
        elements.confirmationMessage.classList.remove('hidden');
        elements.confirmationMessage.classList.add('animate-fade-in');
        
        // Réinitialisation du formulaire après l'upload
        elements.fileInput.value = '';
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
            elements.confirmationMessage.classList.add('opacity-0');
            elements.confirmationMessage.classList.remove('animate-fade-in');
            
            setTimeout(() => {
                elements.confirmationMessage.classList.add('hidden');
                elements.confirmationMessage.classList.remove('opacity-0');
            }, 300);
        }, 5000);
    }

    // Affiche un message d'erreur
    function showError(message = "Une erreur est survenue lors de l'upload des fichiers. Veuillez réessayer.") {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-fade-in';
        errorMessage.innerHTML = `
            <div class="flex items-start">
                <svg class="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <div>
                    <p class="font-medium">Erreur lors de l'upload</p>
                    <p class="mt-1 text-red-500">${message}</p>
                </div>
            </div>
        `;
        
        // Supprime les messages d'erreur existants
        const existingError = elements.fileListContainer.querySelector('.bg-red-50');
        if (existingError) {
            existingError.remove();
        }
        
        elements.fileListContainer.prepend(errorMessage);
        
        // Faire défiler jusqu'à l'erreur
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Initialisation
    initEventListeners();
});
