"use client";
import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import HeroSection from '@/components/index/HeroSection';
import FeaturesSection from '@/components/index/FeaturesSection';
import CarouselSection from '@/components/index/CarouselSection';
import Footer from '@/components/index/Footer';
import { getThemeConfig } from '@/utils/themeUtils';

export default function IndexPage() {
  const [theme, setTheme] = useState('light');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { textGradient, primaryColor, textColor, buttonColor } = getThemeConfig(theme);


  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('theme') || 'light';
      setTheme(newTheme);
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);
  const onSelect = useCallback(() => setSelectedIndex(emblaApi?.selectedScrollSnap() || 0), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);



  const carouselItems = [
    {
      image: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1749543404/projet-pfe/other/dashboardAdminPFE_pzdidj.png',
      title: 'Tableau de bord complet',
    },
    {
      image: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1746460186/projet-pfe/other/analysis_md2vzp.jpg',
      title: 'Analyse avancée',
    },
    {
      image: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1746518687/projet-pfe/other/team_collaboration_lq5uzl.jpg',
      title: "Collaboration d'équipe",
    },
  ];

  return (
    <div data-theme={theme} className="min-h-screen">
     
     <HeroSection />

      <FeaturesSection
        theme={theme}
        primaryColor={primaryColor}
        textColor={textColor}
      />

      <CarouselSection
        theme={theme}
        emblaRef={emblaRef}
        scrollPrev={scrollPrev}
        scrollNext={scrollNext}
        scrollTo={scrollTo}
        selectedIndex={selectedIndex}
        carouselItems={carouselItems}
      />

      <Footer />
    </div>
  );
}