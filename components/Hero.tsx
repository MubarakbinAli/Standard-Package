
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroProps {
  // Allow string for backward compatibility, but prefer array
  backgroundImages: string | string[];
}

const Hero: React.FC<HeroProps> = ({ backgroundImages }) => {
  // Normalize input to array to handle both single string (legacy) and array (new)
  const images = Array.isArray(backgroundImages) 
    ? backgroundImages 
    : backgroundImages ? [backgroundImages] : [];
    
  // Fallback if empty
  const safeImages = images.length > 0 ? images : ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/402854972.jpg?k=f1b953d922904c06282924151212879685a36329067b439c0879e273a7c66914&o=&hp=1"];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    if (safeImages.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(timer);
  }, [safeImages.length]);

  const scrollToContent = () => {
    const element = document.getElementById('intro');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative h-[90vh] flex flex-col items-center justify-center text-center text-white rounded-b-[50px] overflow-hidden shadow-xl bg-darkbrown">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: 1.5, ease: "easeInOut" },
              scale: { duration: 7, ease: "linear" } // Slow luxurious zoom
            }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url("${safeImages[currentIndex]}")` 
            }}
          />
        </AnimatePresence>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-10"></div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        className="relative z-20 px-4"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">
          عروض منتجعات الأيورفيدا
        </h1>
        <h2 className="text-2xl md:text-3xl font-light mb-8 text-gray-100">
          الهند ، كيرلا
        </h2>
        <div className="text-6xl md:text-8xl font-black text-primary opacity-90 drop-shadow-md">
          2025
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 z-20 cursor-pointer"
        onClick={scrollToContent}
      >
        <ChevronDown size={48} className="text-white opacity-80 hover:text-primary transition-colors" />
      </motion.div>
    </header>
  );
};

export default Hero;
