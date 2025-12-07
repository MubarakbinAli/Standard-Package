
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const scrollToContent = () => {
    const element = document.getElementById('intro');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative h-[90vh] flex flex-col items-center justify-center text-center text-white rounded-b-[50px] overflow-hidden shadow-xl">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          // Updated image: Serene Kerala Nature (Backwaters/Greenery), no people
          backgroundImage: "url('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 px-4"
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
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 z-10 cursor-pointer"
        onClick={scrollToContent}
      >
        <ChevronDown size={48} className="text-white opacity-80 hover:text-primary transition-colors" />
      </motion.div>
    </header>
  );
};

export default Hero;