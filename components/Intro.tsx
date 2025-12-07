import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const Intro: React.FC = () => {
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
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
          نظام طبي هندي تقليدي يعتمد على توازن الجسم والعقل والروح. نقدم لكم في عام 2025 
          باقة مختارة من أرقى المنتجعات العلاجية في كيرلا، لتنطلقوا في رحلة تحول نحو 
          الرفاهية والشفاء، وسط أحضان الطبيعة الخلابة.
        </p>
      </motion.div>
    </section>
  );
};

export default Intro;
