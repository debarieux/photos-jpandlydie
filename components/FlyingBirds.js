import { useMemo } from 'react';

const FlyingBirds = ({ count = 10 }) => {
  const birds = useMemo(() => Array.from({ length: count }), [count]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {birds.map((_, i) => {
        // Génération de valeurs aléatoires pour le style
        const top = 10 + Math.random() * 80; // Entre 10% et 90%
        const left = -50 + Math.random() * 150; // Entre -50% et 100%
        const size = 20 + Math.random() * 40; // Entre 20px et 60px
        const duration = 10 + Math.random() * 15; // Entre 10s et 25s
        const delay = Math.random() * 10; // Jusqu'à 10s de délai
        const opacity = 0.5 + Math.random() * 0.5; // Entre 0.5 et 1
        const scaleX = Math.random() > 0.5 ? 1 : -1; // Direction aléatoire

        return (
          <svg
            key={i}
            className="absolute w-12 h-12 text-orange-300"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: 'auto',
              animation: `fly ${duration}s linear ${delay}s infinite`,
              opacity,
              transform: `scaleX(${scaleX})`,
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        );
      })}
      <style jsx global>{`
        @keyframes fly {
          0% {
            transform: translateX(-100vw) scaleX(${Math.random() > 0.5 ? 1 : -1});
          }
          100% {
            transform: translateX(100vw) scaleX(${Math.random() > 0.5 ? 1 : -1});
          }
        }
      `}</style>
    </div>
  );
};

export default FlyingBirds;
