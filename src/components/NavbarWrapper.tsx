// components/NavbarWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/index/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const showNavbar = !pathname?.startsWith("/home");
  
  return showNavbar ? <Navbar /> : null;
}