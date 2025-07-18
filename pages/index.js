import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';

// Configuration d'ImageKit.io
const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const FOLDER_NAME = 'mariage-jp-lydie';
const AUTH_ENDPOINT = '/api/auth';

// Composant pour les oiseaux volants
function FlyingBirds({ count = 10 }) {
  const birds = Array.from({ length: count });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {birds.map((_, i) => {
        const top = 10 + Math.random() * 80;
        const duration = 12 + Math.random() * 8;
        const delay = Math.random() * 10;
        const size = 25 + Math.random() * 20;
        const opacity = 0.6 + Math.random() * 0.4;
        const direction = Math.random() > 0.5 ? 1 : -1;

        return (
          <svg
            key={i}
            className="absolute animate-flyAcross"
            style={{
              top: `${top}%`,
              left: direction > 0 ? '-50px' : '105vw',
              width: `${size}px`,
              height: 'auto',
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              opacity,
              transform: `scaleX(${direction})`
            }}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23 3.75C23 3.75 21 7 16.5 7C15.5 7 14.5 6.5 14 6C13.5 5.5 13 4.5 13 3.5C13 2.5 13.5 1.5 14 1C14.5 0.5 15.5 0 16.5 0C21 0 23 3.75 23 3.75Z"
              fill="#FFD700"
            />
            <path
              d="M14 6C14 6 16 8 16 10C16 12 14 14 14 14"
              stroke="#FFA500"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

// Composant pour les cœurs flottants
function FloatingHearts({ show }) {
  if (!show) return null;
  
  const hearts = Array.from({ length: 15 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {hearts.map((_, i) => {
        const left = 10 + Math.random() * 80;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 2;
        const size = 20 + Math.random() * 30;
        const opacity = 0.6 + Math.random() * 0.4;
        
        return (
          <div
            key={i}
            className="absolute text-pink-500 animate-float"
            style={{
              left: `${left}%`,
              bottom: '0',
              fontSize: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              opacity,
              transform: 'translateY(100%)'
            }}
          >
            ❤️
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Récupère les paramètres d'authentification depuis le serveur
  const getAuthParams = async () => {
    try {
      console.log('Tentative de récupération des paramètres d\'authentification depuis:', AUTH_ENDPOINT);
      const response = await fetch(AUTH_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      console.log('Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de réponse:', errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Paramètres d\'authentification reçus:', data);
      return data;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres d\'authentification:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Impossible de se connecter au serveur d'authentification: ${error.message}`);
    }
  };

  // Crée un objet FormData pour l'upload
  const createFormData = async (file) => {
    const authParams = await getAuthParams();
    const formData = new FormData();
    
    // Ajout des paramètres d'authentification
    Object.keys(authParams).forEach(key => {
      formData.append(key, authParams[key]);
    });
    
    // Ajout des paramètres du fichier
    formData.append('file', file);
    formData.append('fileName', `${FOLDER_NAME}/${Date.now()}-${file.name}`);
    formData.append('useUniqueFileName', 'true');
    formData.append('folder', FOLDER_NAME);
    
    return formData;
  };

  // Gestion du glisser-déposer
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Gestion de la sélection de fichiers
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }));
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    uploadFiles(newFiles);
  };

  // Téléverse les fichiers vers ImageKit
  const uploadFiles = async (filesToUpload) => {
    setIsUploading(true);
    setError(null);
    
    try {
      for (const file of filesToUpload) {
        try {
          const formData = await createFormData(file.file);
          await uploadFile(formData, file);
        } catch (error) {
          console.error('Erreur lors de l\'upload:', error);
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.preview === file.preview 
                ? { ...f, status: 'error', error: error.message }
                : f
            )
          );
        }
      }
      
      // Afficher le message de succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
    } catch (error) {
      console.error('Erreur lors du traitement des fichiers:', error);
      setError('Une erreur est survenue lors du téléversement des fichiers. Veuillez réessayer.');
    } finally {
      setIsUploading(false);
    }
  };

  // Téléverse un seul fichier
  const uploadFile = (formData, fileInfo) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.preview === fileInfo.preview 
                ? { ...f, progress, status: 'uploading' }
                : f
            )
          );
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.preview === fileInfo.preview 
                ? { ...f, status: 'done', progress: 100 }
                : f
            )
          );
          resolve(xhr.response);
        } else {
          const error = new Error(`Erreur HTTP ${xhr.status}`);
          error.status = xhr.status;
          reject(error);
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Erreur réseau lors de l\'upload'));
      };
      
      xhr.open('POST', UPLOAD_URL, true);
      xhr.send(formData);
    });
  };

  // Formatage de la taille des fichiers
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Nettoyage des URLs de prévisualisation
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      <Head>
        <title>Partage de photos - Mariage de Jean-Philippe & Lydia</title>
        <meta name="description" content="Partagez vos plus beaux moments de notre mariage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FlyingBirds count={8} />
      <FloatingHearts show={showSuccess} />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-cursive text-pink-600 mb-4">
            Partagez vos plus beaux moments
          </h1>
          <p className="text-xl text-gray-600">
            Téléchargez vos photos préférées de notre journée de mariage
          </p>
        </div>

        {/* Zone de dépôt */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            isDragging ? 'border-pink-400 bg-pink-50' : 'border-pink-200 hover:border-pink-300'
          } mb-8`}
        >
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-pink-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              {isDragging ? 'Déposez vos photos ici' : 'Glissez-déposez vos photos ici'}
            </h2>
            <p className="text-gray-500 mb-4">ou</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Sélectionner des fichiers
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Formats acceptés : JPG, PNG, HEIC (max 10 Mo par fichier)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Liste des fichiers */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">
                {files.length} {files.length === 1 ? 'fichier sélectionné' : 'fichiers sélectionnés'}
              </h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <li key={index} className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                      {file.preview && (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      {file.status === 'uploading' && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      )}
                      {file.status === 'done' && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Téléversement réussi
                        </p>
                      )}
                      {file.status === 'error' && (
                        <p className="text-sm text-red-600 mt-1">
                          ✗ Erreur: {file.error || 'Échec du téléversement'}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => uploadFiles(files.filter(f => f.status !== 'done'))}
                disabled={isUploading || files.every(f => f.status === 'done')}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isUploading || files.every(f => f.status === 'done')
                    ? 'bg-pink-300 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
              >
                {isUploading ? 'Téléversement en cours...' : 'Téléverser les fichiers'}
              </button>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {showSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p>Vos photos ont été téléversées avec succès ! Merci pour votre partage.</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="font-bold float-right"
            >
              ×
            </button>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes flyAcross {
          0% {
            transform: translateX(-100px) scaleX(var(--direction, 1));
          }
          100% {
            transform: translateX(calc(100vw + 100px)) scaleX(var(--direction, 1));
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(100%) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        .animate-flyAcross {
          animation: flyAcross 20s linear infinite;
          --direction: 1;
        }
        
        .animate-float {
          animation: float 3s ease-in-out forwards;
        }
        
        .font-cursive {
          font-family: 'Parisienne', cursive;
        }
      `}</style>
    </div>
  );
}
