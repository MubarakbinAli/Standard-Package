
import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft } from 'lucide-react';

interface IntroProps {
  onLearnMore: () => void;
}

const Intro: React.FC<IntroProps> = ({ onLearnMore }) => {
  return (
    <section id="intro" className="py-20 px-6 max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center mb-6">
          <Leaf className="text-primary w-12 h-12" />
        </div>
        <h3 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
          الأيورفيدا: توازن الروح والجسد
        </h3>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
          نظام طبي هندي تقليدي يعتمد على توازن الجسم والعقل والروح. نقدم لكم في عام 2025 
          باقة مختارة من أرقى المنتجعات العلاجية في كيرلا، لتنطلقوا في رحلة تحول نحو 
          الرفاهية والشفاء، وسط أحضان الطبيعة الخلابة.
        </p>

        <button 
          onClick={onLearnMore}
          className="bg-secondary text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-primary transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
        >
          <span>تعرف أكثر عن الأيورفيدا</span>
          <ArrowLeft size={20} />
        </button>
      </motion.div>
    </section>
  );
};

export default Intro;
