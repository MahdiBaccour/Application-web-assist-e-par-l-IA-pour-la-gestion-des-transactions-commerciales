import {  FaLinkedin, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="py-12 bg-base-200">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">À propos de nous</h4>
            <p className="mb-4">
              Révolutionner la gestion de la chaîne d'approvisionnement grâce à une technologie innovante
              et des solutions basées sur les données.
            </p>
          </div>
          <div>
              <h4 className=" text-lg font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#">
                  Études de cas
                  </a>
                </li>
                <li>
                  <a href="#">
                  Référence API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Juridique</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#">
                  Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#">
                  Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#">
                  Sécurité
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="e text-lg font-semibold mb-4">Connecter</h4>
              <div className="flex space-x-4">
                <a href="#" >
                  <FaXTwitter className="w-6 h-6" />
                </a>
                <a href="#">
                  <FaLinkedin className="w-6 h-6" />
                </a>
                <a href="#">
                  <FaFacebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center">
            <p>© {new Date().getFullYear()} SupplyChain Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
  );
}