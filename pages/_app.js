import { useEffect } from 'react';
import '../styles/globals.css';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  // Configuration d'ImageKit
  useEffect(() => {
    window.ENV = {
      IMAGEKIT_PUBLIC_KEY: "public_GsdYxjQC21Ltg6Yn3DIxNDAPwZ8=",
      IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/mvhberuj5"
    };
  }, []);

  return (
    <>
      <Head>
        <title>Mariage Lydie & Jean-Philippe</title>
        <meta name="description" content="Partagez vos plus beaux moments de notre mariage" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
