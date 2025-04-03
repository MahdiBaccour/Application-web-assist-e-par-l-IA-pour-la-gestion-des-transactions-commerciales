import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaTwitter  } from "react-icons/fa6";

export const Footer = () => (
  <footer className="footer items-center p-4 bg-base-200 text-base-content">
    <div className="items-center grid-flow-col">
      <p>© {new Date().getFullYear()} Your Company. All rights reserved</p>
    </div>
    <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
      <a className="hover:text-primary"><FaFacebook size={24} /></a>
      <a className="hover:text-primary"><FaTwitter size={24} /></a>
      <a className="hover:text-primary"><FaLinkedin size={24} /></a>
    </div>
  </footer>
);