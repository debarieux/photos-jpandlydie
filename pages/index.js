import { useRef, useState, useEffect } from "react";

// Génère des oiseaux SVG qui volent
function FlyingBirds({ count = 10 }) {
  const birds = Array.from({ length: count });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {birds.map((_, i) => {
        // Trajectoire et style aléatoire
        const top = 10 + Math.random() * 80;
        const duration = 12 + Math.random() * 8;
        const delay = Math.random() * 10;
        const size = 25 + Math.random() * 20;
        const color = ['#f8b195', '#fbbf24', '#fffbe6'][Math.floor(Math.random() * 3)];
        const opacity = 0.6 + Math.random() * 0.4;
        const direction = Math.random() > 0.5 ? 1 : -1; // 1 pour L -> R, -1 pour R -> L

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
              transform: `scaleX(${direction})` // Inverse le SVG pour changer de direction
            }}
            viewBox="0 0 50 32"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.2,16.4C2.2,16.4,6.1,13,10.5,13c4,0,6.5,3.5,10.2,3.5c3.7,0,6.8-4.2,10.8-4.2c4,0,6.2,3.2,9.8,3.2c3.6,0,4.9-2.5,4.9-2.5" />
            <path d="M2.2,20.4C2.2,20.4,6.1,17,10.5,17c4,0,6.5,3.5,10.2,3.5c3.7,0,6.8-4.2,10.8-4.2c4,0,6.2,3.2,9.8,3.2c3.6,0,4.9-2.5,4.9-2.5" />
          </svg>
        );
      })}
    </div>
  );
}

// Génère des cœurs flottants lors du succès
function FloatingHearts({ show }) {
  const [hearts, setHearts] = useState([]);
  useEffect(() => {
    if (show) {
      const newHearts = Array.from({ length: 8 }).map((_, i) => ({
        left: 10 + Math.random() * 80,
        delay: Math.random() * 0.8,
        size: 18 + Math.random() * 22,
        key: i + Math.random()
      }));
      setHearts(newHearts);
    } else {
      setHearts([]);
    }
  }, [show]);
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {hearts.map(({ left, delay, size, key }) => (
        <svg
          key={key}
          className="absolute animate-heart"
          style={{
            left: `${left}%`,
            bottom: '40px',
            width: `${size}px`,
            height: `${size * 0.9}px`,
            animationDelay: `${delay}s`
          }}
          viewBox="0 0 40 36"
          fill="none"
        >
          <path d="M20 33S2 20.5 2 11.5C2 6.253 6.253 2 11.5 2c3.037 0 5.77 1.617 7.5 4.09C20.73 3.617 23.463 2 26.5 2 31.747 2 36 6.253 36 11.5c0 9-18 21.5-18 21.5z" fill="#f8b195" stroke="#f59e42" strokeWidth="2"/>
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  const [confirmation, setConfirmation] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInput = useRef();

  const handleFiles = (files) => {
    setFileList(Array.from(files));
    uploadFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  async function uploadFiles(files) {
    setUploading(true);
    setProgress(0);
    try {
      // 1. Obtenir la signature du backend
      const authResponse = await fetch("/api/auth");
      if (!authResponse.ok) {
        throw new Error(`Erreur d'authentification: ${authResponse.statusText}`);
      }
      const { signature, expire, token } = await authResponse.json();

      const filesArray = Array.from(files);
      let totalUploaded = 0;

      for (const file of filesArray) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("publicKey", "public_GsdYxjQC21Ltg6Yn3DIxNDAPwZ8=");
        formData.append("signature", signature);
        formData.append("expire", expire);
        formData.append("token", token);

        const uploadResponse = await fetch(
          "https://upload.imagekit.io/api/v1/files/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          continue;
        }
        totalUploaded++;
        setProgress(Math.round(((totalUploaded) / filesArray.length) * 100));
      }
      setUploading(false);
      setConfirmation(true);
      setFileList([]);
    } catch (error) {
      setUploading(false);
      alert("Erreur lors de l'envoi des fichiers. Veuillez réessayer.");
    }
  }

  return (
    <>
      <FlyingBirds count={12} />
      <main className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <section className="bg-white/90 backdrop-blur-lg shadow-2xl shadow-orange-200/60 rounded-3xl w-full max-w-2xl p-8 md:p-14 text-center border border-amber-200/80 ring-2 ring-orange-100/60">
          {/* Carte prénoms */}
          <header className="mb-10">
            <div className="inline-block px-8 py-5 rounded-2xl shadow-lg bg-gradient-to-br from-orange-50/90 to-amber-100/80 border border-amber-200/70 relative">
              <h1 className="text-[2.5rem] md:text-[3.5rem] font-[Parisienne,cursive] text-orange-600 drop-shadow-sm flex flex-col items-center leading-tight">
                <span className="tracking-wide">Lidye</span>
                <span className="text-4xl md:text-5xl text-amber-400 my-1 drop-shadow-lg">&amp;</span>
                <span className="tracking-wide">Jean-Philippe</span>
              </h1>
              {/* Séparateur floral */}
              <svg className="mx-auto mt-2" width="80" height="18" viewBox="0 0 80 18" fill="none"><path d="M5 9 Q15 0 40 9 Q65 18 75 9" stroke="#F59E42" strokeWidth="2" fill="none"/><circle cx="40" cy="9" r="3" fill="#f8b195"/></svg>
            </div>
            <h2 className="mt-8 text-[2rem] md:text-[2.5rem] font-[Parisienne,cursive] text-orange-400">Partagez vos souvenirs</h2>
            <p className="mt-2 text-lg text-orange-900/80 italic font-normal">Déposez ici vos plus beaux moments de bonheur partagé</p>
          </header>
          {!confirmation ? (
            <form
              className="space-y-7"
              onSubmit={(e) => {
                e.preventDefault();
                if (fileInput.current.files.length > 0) {
                  handleFiles(fileInput.current.files);
                }
              }}
            >
              {/* Zone de drag & drop */}
              <div
                id="drop-zone"
                className="drop-zone group rounded-2xl p-12 cursor-pointer border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 via-amber-50 to-white shadow-inner shadow-orange-100/40 transition hover:scale-105 hover:shadow-amber-200/70 relative overflow-hidden"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInput.current.click()}
              >
                {/* Halo lumineux */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-amber-100/80 via-orange-50/70 to-transparent opacity-70" />
                <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
                  {/* Icône photo abricot */}
                  <svg className="w-16 h-16 text-orange-300 group-hover:text-orange-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-orange-800/80 font-medium">Glissez & déposez vos photos ici</p>
                  <p className="text-sm text-orange-400">ou</p>
                  <button type="button" className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 text-white font-semibold px-10 py-3 rounded-full border-2 border-amber-200 shadow-lg hover:from-orange-500 hover:to-amber-600 hover:shadow-orange-300/70 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300" onClick={(e) => {e.preventDefault(); fileInput.current.click();}}>Choisir des fichiers</button>
                </div>
                <input
                  type="file"
                  ref={fileInput}
                  className="hidden"
                  multiple
                  accept="image/png, image/jpeg, image/gif, image/heic"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
              {/* Liste des fichiers */}
              {fileList.length > 0 && (
                <div className="text-left mt-4">
                  <ul className="list-disc list-inside text-orange-700/80">
                    {fileList.map((file, idx) => (
                      <li key={idx}>{file.name} <span className="text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Barre de progression */}
              {uploading && (
                <div className="mt-4 w-full bg-orange-100 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-orange-400 to-amber-400 h-2.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </form>
          ) : (
            <div className="mt-10 p-10 bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100 border border-orange-200 text-orange-800 rounded-2xl shadow-inner shadow-orange-200/50 relative">
              {/* Cœur stylisé */}
              <svg className="mx-auto mb-2" width="40" height="36" viewBox="0 0 40 36" fill="none"><path d="M20 33S2 20.5 2 11.5C2 6.253 6.253 2 11.5 2c3.037 0 5.77 1.617 7.5 4.09C20.73 3.617 23.463 2 26.5 2 31.747 2 36 6.253 36 11.5c0 9-18 21.5-18 21.5z" fill="#f8b195" stroke="#f59e42" strokeWidth="2"/></svg>
              <h2 className="text-2xl md:text-3xl font-[Parisienne,cursive] text-orange-600">Merci !</h2>
              <p className="mt-2 text-lg font-[Cormorant Garamond,serif] text-orange-900/80">Vos photos ont bien été envoyées.<br />Nous avons hâte de les découvrir !</p>
            </div>
          )}
        </section>
      </main>
    </>

  );
}
