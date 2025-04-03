"use client";
import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiArrowRight, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import Autoplay from 'embla-carousel-autoplay';
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedin, FaFacebook } from 'react-icons/fa';
import Navbar from './Navbar';
import { useTheme } from './ThemeProvider';

export default function IndexPage() {
  const { theme } = useTheme();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);
  const onSelect = useCallback(() => setSelectedIndex(emblaApi?.selectedScrollSnap() || 0), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  // Theme-aware text gradients
  const textGradient = theme === 'dark' 
    ? 'text-gray-300'
    : 'bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent';

  const paragraphColor = theme === 'dark' 
    ? 'text-gray-400'
    : 'text-gray-600';

  const features = [
    {
      title: 'Supply Chain Management',
      description: 'End-to-end visibility and control over your supply chain operations',
      icon: <FiCheckCircle className="w-6 h-6" />,
    },
    {
      title: 'Real-time Analytics',
      description: 'Powerful insights and data-driven decision-making tools',
      icon: <FiCheckCircle className="w-6 h-6" />,
    },
    {
      title: 'Collaboration Tools',
      description: 'Seamless communication between suppliers, clients, and teams',
      icon: <FiCheckCircle className="w-6 h-6" />,
    },
  ];

  const carouselItems = [
    {
      image: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1716376489/dashboard1_jy5hhn.webp',
      title: 'Comprehensive Dashboard',
    },
    {
      image: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1716376489/analytics1_ysxwqy.webp',
      title: 'Advanced Analytics',
    },
    {
      image: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1716376489/collaboration1_ibqk3k.webp',
      title: 'Team Collaboration',
    },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-indigo-50'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-8">
            <h1 className={`text-5xl font-bold ${textGradient}`}>
              Transform Your Supply Chain with {' '}
              <span className={theme === 'dark' ? 'text-white' : 'text-indigo-600'}>
                Intelligent Management
              </span>
            </h1>
            <p className={`text-xl ${paragraphColor}`}>
              Streamline operations, enhance collaboration, and boost efficiency with our all-in-one
              supply chain management platform.
            </p>
            <div className="flex gap-4">
              <button className={`btn ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-indigo-600 text-white'} px-8 py-4 text-lg`}>
                Get Started
                <FiArrowRight className="ml-2" />
              </button>
              <button className={`btn ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-900'} px-8 py-4 text-lg`}>
                Learn More
              </button>
            </div>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://res.cloudinary.com/dmnuz4h65/image/upload/v1716376489/hero1_iz4tqk.webp"
              alt="Supply Chain Management"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'} transition-all`}
              >
                <div className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className={`text-2xl font-semibold ${textGradient}`}>
                  {feature.title}
                </h3>
                <p className={`${paragraphColor}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-indigo-50'}`}>
        <div className="container mx-auto px-6">
          <div className="embla overflow-hidden relative" ref={emblaRef}>
            <div className="embla__container flex">
              {carouselItems.map((item, index) => (
                <div className="embla__slide flex-[0_0_100%] min-w-0" key={index}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative h-96 rounded-2xl overflow-hidden"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-8">
                      <h3 className="text-3xl font-bold text-white">{item.title}</h3>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              className={`embla__prev absolute top-1/2 left-4 transform -translate-y-1/2 p-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-600' : 'bg-white/50 hover:bg-white/80'
              }`}
              onClick={scrollPrev}
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>
            <button
              className={`embla__next absolute top-1/2 right-4 transform -translate-y-1/2 p-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-600' : 'bg-white/50 hover:bg-white/80'
              }`}
              onClick={scrollNext}
            >
              <FiArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-4 space-x-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === selectedIndex 
                    ? 'bg-indigo-600' 
                    : theme === 'dark' 
                      ? 'bg-gray-600' 
                      : 'bg-gray-300'
                }`}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">About Us</h4>
              <p className="mb-4">
                Revolutionizing supply chain management through innovative technology and
                data-driven solutions.
              </p>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-indigo-400">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-400">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-400">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-indigo-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-400">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-400">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-indigo-400">
                  <FaXTwitter className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-indigo-400">
                  <FaLinkedin className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-indigo-400">
                  <FaFacebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>© {new Date().getFullYear()} SupplyChain Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}