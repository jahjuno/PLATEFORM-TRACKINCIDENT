import React, { useState, useEffect } from 'react';

export default function SplashAnimation() {
  const [visible, setVisible] = useState(true);
  const [textVisible, setTextVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Afficher le texte après un court délai
    const textTimer = setTimeout(() => {
      setTextVisible(true);
    }, 500);

    // Lancer le fadeout après 2.5 secondes
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Masquer l'animation après 3 secondes
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-primary-navy z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative">
        {/* Cercle lumineux derrière le texte */}
        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30 scale-150 animate-pulse"></div>
        
        {/* Texte principal avec animation */}
        <div className={`relative transition-all duration-700 transform ${textVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <h1 className="text-6xl font-bold">
            <span className="text-yellow-400">Teams </span>
            <span className="text-primary-navy bg-yellow-400 px-2 rounded">O&M</span>
            <span className="text-yellow-400"> xyz</span>
          </h1>
          
          {/* Ligne qui s'étend sous le texte */}
          <div className={`h-1 bg-yellow-400 mt-2 transition-all duration-1000 ease-out ${textVisible ? 'w-full' : 'w-0'}`}></div>
        </div>

        {/* Éléments décoratifs - motifs bleus */}
        <div className="absolute -top-16 -left-16 w-24 h-24 bg-primary-navy rounded-full opacity-80"></div>
        <div className="absolute -bottom-16 -right-16 w-20 h-20 bg-primary-navy rounded-full opacity-80"></div>
        <div className="absolute top-12 -right-12 w-16 h-16 bg-primary-navy rounded-full opacity-70"></div>
        <div className="absolute -bottom-12 left-12 w-16 h-16 bg-primary-navy rounded-full opacity-70"></div>
      </div>
    </div>
  );
}