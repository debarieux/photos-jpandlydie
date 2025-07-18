import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Error({ statusCode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
      <Head>
        <title>Erreur {statusCode || ''} | Mariage Lydie & Jean-Philippe</title>
      </Head>
      
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-parisienne text-orange-800 mb-4">
          Oups ! {statusCode ? `Erreur ${statusCode}` : 'Une erreur est survenue'}
        </h1>
        
        <p className="text-orange-700 font-cormorant mb-6">
          {statusCode === 404
            ? 'La page que vous cherchez semble introuvable.'
            : 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.'}
        </p>
        
        <Link href="/" legacyBehavior>
          <a className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-cormorant px-6 py-2 rounded-full transition-colors">
            Retour à l'accueil
          </a>
        </Link>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
