// app/forbidden/page.jsx
'use client'
import { useEffect } from 'react'
import Image from 'next/image'

export default function ForbiddenPage() {
  useEffect(() => {
    document.title = "401 - Accès non autorisé";
  }, []);
  return (
    <>
     <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
        <Image
          src="https://res.cloudinary.com/dmnuz4h65/image/upload/v1744541814/projet-pfe/other/401_sflo1g.png"
          alt="Accès refusé"
          width={400}
          height={400}
          className="mb-6"
        />
        <h1 className="text-2xl font-bold text-error mb-2">Accès refusé</h1>
        <p className="text-gray-600 max-w-md">
          Vous n’avez pas les autorisations nécessaires pour accéder à cette page. Veuillez contacter l’administrateur ou revenir à la page d’accueil.
        </p>
      </div>
    </>
     
  )
}