'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HeroSection() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <section className="container mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="grid lg:grid-cols-2 gap-12 items-center"
      >
        <div className="space-y-8">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Transformez votre chaîne logistique
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
              avec Gestion Intelligente
            </span>
          </h1>
          
          <p className="text-xl text-base-content/80">
            Rationalisez vos opérations, améliorez votre collaboration et augmentez votre efficacité grâce à notre plateforme tout-en-un.
          </p>
                
          <div className="w-full flex justify-center mt-8">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {session ? (
                <button
                  className="btn btn-success gap-2 text-lg transition-transform flex items-center justify-center"
                  style={{ padding: '0.6rem 0.6rem' }}
                  onClick={() => router.push('/home')}
                >
                  Tableau de bord
                  <FiArrowRight className="text-xl" />
                </button>
              ) : (
                <button
                  className="btn btn-primary gap-2 text-lg transition-transform flex items-center justify-center"
                  style={{ padding: '0.6rem 0.6rem' }}
                  onClick={() => router.push('/start')}
                >
                  Commencer
                  <FiArrowRight className="text-xl" />
                </button>
              )}

              <Link
                href="/spaces"
                className="btn btn-outline gap-2 text-lg flex items-center justify-center transition-colors duration-300"
                style={{ padding: '0.6rem 0.6rem' }}
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>

        <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl border-2 border-base-200">
          <Image
            src="https://res.cloudinary.com/dmnuz4h65/image/upload/v1746457732/projet-pfe/other/index1_tamugt.jpg"
            alt="Supply Chain Management"
            fill
            className="object-cover"
            priority
          />
        </div>
      </motion.div>
    </section>
  );
}