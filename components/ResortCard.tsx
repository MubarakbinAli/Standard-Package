
import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Resort } from '../lib/types';

interface ResortCardProps {
  resort: Resort;
  onClick: (resort: Resort) => void;
}

const ResortCard: React.FC<ResortCardProps> = ({ resort, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
      onClick={() => onClick(resort)}
    >
      <div className="relative h-64 overflow-hidden">
        {resort.badge && (
          <span className="absolute top-4 right-4 z-10 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            {resort.badge}
          </span>
        )}
        <div 
          className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${resort.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 group-hover:opacity-50 transition-opacity duration-700"></div>
      </div>
      
      <div className="p-6">
        <h4 className="text-2xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
          {resort.name}
        </h4>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin size={16} className="ml-1 text-primary" />
          {resort.location}
        </div>
        
        <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
          {resort.description}
        </p>

        <button 
          className="w-full bg-secondary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors duration-300"
        >
          استعراض الباقات والأسعار
        </button>
      </div>
    </motion.div>
  );
};

export default ResortCard;
