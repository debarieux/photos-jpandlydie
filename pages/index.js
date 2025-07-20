import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';

// Fonction pour convertir un fichier en base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Composant pour les oiseaux volants (chargé uniquement côté client)
const FlyingBirds = dynamic(
  () => import('../components/FlyingBirds'),
  { ssr: false }
);

// Composant pour les cœurs flottants
function FloatingHearts({ show }) {
  if (!show) return null;
  
  const hearts = Array.from({ length: 15 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
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

function Home() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);


  // Gestion du glisser-déposer
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Vérification spécifique pour mobile
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        setError('Sur mobile, veuillez utiliser le bouton "Sélectionner des fichiers"');
        return;
      }
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
    const newFiles = Array.from(fileList)
      .filter(file => {
        // Filtre les types MIME pour mobiles (HEIC, etc.)
        const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
        return validTypes.includes(file.type);
      })
      .map(file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type.includes('heic') ? 'image/jpeg' : file.type, // Normalise le type
        preview: URL.createObjectURL(file),
        status: 'pending',
        progress: 0
      }));
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    uploadFiles(newFiles);
  };

  // Envoie les fichiers par email via l'API
  const uploadFiles = async (filesToUpload) => {
    setIsUploading(true);
    setError(null);
    
    try {
      // Convertir les fichiers en base64 avant l'envoi
      const filesWithBase64 = await Promise.all(
        filesToUpload.map(async (file) => ({
          ...file,
          base64: await fileToBase64(file.file)
        }))
      );

      // Envoyer les fichiers à l'API
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: filesWithBase64.map(({ name, type, base64 }) => ({
            name,
            type,
            base64
          })),
          senderName,
          senderEmail
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Mise à jour de l'état
        setFiles([]);
        setSenderName('');
        setSenderEmail('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(data.error || 'Échec de l\'envoi');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi des fichiers:', error);
      setFiles(prevFiles => 
        prevFiles.map(f => 
          filesToUpload.some(uploaded => uploaded.preview === f.preview)
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );
      setError('Une erreur est survenue lors de l\'envoi des fichiers. Veuillez réessayer.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Suivi de la progression de l'upload
  const trackProgress = (filePreview, progress) => {
    setFiles(prevFiles => 
      prevFiles.map(f => 
        f.preview === filePreview 
          ? { ...f, progress, status: 'uploading' }
          : f
      )
    );
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
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4 sm:p-6">
      <Head>
        <title>Partage de photos - Mariage de Jean-Philippe & Lydia</title>
        <meta name="description" content="Partagez vos plus beaux moments de notre mariage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FlyingBirds count={8} />
      <FloatingHearts show={showSuccess} />

      <div className="w-full max-w-md">
        <div className="card w-full bg-white rounded-2xl shadow-card overflow-hidden">
          {/* En-tête avec le titre */}
          <div className="py-8 sm:py-12 px-4 sm:px-8 text-center bg-gradient-to-b from-orange-50 to-white">
            <div className="mb-2">
              <h1 className="text-3xl sm:text-4xl font-parisienne text-orange-800 leading-none">Lydie</h1>
              <div className="text-orange-500 text-2xl sm:text-3xl font-parisienne -mt-2 mb-1">&</div>
              <h1 className="text-3xl sm:text-4xl font-parisienne text-orange-800 leading-none">Jean-Philippe</h1>
            </div>
            <div className="relative mt-8 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-orange-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-orange-700 font-parisienne text-base sm:text-lg">
                  Partagez vos plus beaux moments avec nous
                </span>
              </div>
            </div>
            <p className="text-orange-600 font-cormorant italic text-sm sm:text-base text-center mt-2">
              Déposez ici vos moments de bonheur partagé
            </p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Zone de dépôt */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`drop-zone rounded-xl p-6 sm:p-8 md:p-12 text-center cursor-pointer mb-6 sm:mb-8 transition-all duration-200 ${
                isDragging ? 'border-2 border-orange-400 bg-orange-50' : 'border-2 border-dashed border-orange-200 hover:border-orange-300 bg-white'
              }`}
            >
              <div className="max-w-xs mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-parisienne text-orange-800 mb-2">
                  {isDragging ? 'Déposez vos photos ici' : 'Ajoutez vos photos'}
                </h3>
                <p className="text-orange-500 mb-4 font-cormorant">Glissez et déposez vos fichiers ici ou</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-button text-white font-cormorant text-lg px-6 py-2 rounded-full shadow-button hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
                >
                  Sélectionner des fichiers
                </button>
                <p className="text-sm text-orange-600 mt-4 font-cormorant">
                  Formats acceptés : JPG, PNG, HEIC (max 10 Mo par fichier)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/heic"
                multiple
                capture="environment" // Permet d'utiliser l'appareil photo directement sur mobile
                className="hidden"
                onChange={handleFileSelect}
                onClick={(e) => {
                  // Réinitialise la valeur pour permettre la sélection du même fichier
                  e.target.value = null;
                }}
              />
            </div>
          </div>

          {/* Liste des fichiers */}
          {files.length > 0 && (
            <div className="px-4 sm:px-6 pb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-apricot-100">
                <div className="p-4 border-b border-apricot-100 bg-gradient-to-r from-warm-50 to-white">
                  <h2 className="text-lg font-medium text-apricot-800 font-cormorant">
                    {files.length} {files.length === 1 ? 'fichier sélectionné' : 'fichiers sélectionnés'}
                  </h2>
                </div>
                <ul className="divide-y divide-apricot-100">
                  {files.map((file, index) => (
                    <li key={index} className="p-4 hover:bg-warm-50/50 transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden bg-warm-100 border border-apricot-100">
                          {file.preview && (
                            <div className="h-full w-full relative">
                              <Image
                                src={file.preview}
                                alt={file.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="text-sm font-medium text-apricot-900 truncate font-cormorant">
                            {file.name}
                          </p>
                          <p className="text-sm text-apricot-700 font-cormorant">
                            {formatFileSize(file.size)}
                          </p>
                          {file.status === 'uploading' && (
                            <div className="w-full bg-warm-200 rounded-full h-2 mt-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-apricot-400 to-apricot-600 h-2 rounded-full transition-all duration-300"
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
                    className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-cormorant text-lg rounded-full text-white ${
                      isUploading || files.every(f => f.status === 'done')
                        ? 'bg-apricot-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-apricot-500 to-apricot-600 hover:from-apricot-600 hover:to-apricot-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-apricot-300 transition-all duration-300`}
                  >
                    {isUploading ? 'Téléversement en cours...' : 'Téléverser les fichiers'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message de succès */}
        {showSuccess && (
          <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-sm border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-xl max-w-sm transition-all duration-300 transform hover:scale-105">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-cormorant font-medium">Vos photos ont été téléversées avec succès !</p>
                <p className="text-xs text-green-700 mt-1">Merci pour votre partage précieux.</p>
              </div>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-sm border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-xl max-w-sm transition-all duration-300 transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-cormorant font-medium">Une erreur est survenue</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                aria-label="Fermer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
