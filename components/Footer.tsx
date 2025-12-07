import React from 'react';
import { Phone } from 'lucide-react';
import { CONTACT_PHONE_DISPLAY } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-darkbrown text-white py-12 mt-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold mb-6 font-sans">عروض منتجعات الأيورفيدا</h3>
        <p className="opacity-70 mb-8">
          رحلتك نحو التوازن والشفاء تبدأ هنا.
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm opacity-60">تواصل معنا عبر واتساب</p>
          <div className="flex items-center gap-2 text-xl font-bold text-primary" dir="ltr">
            <Phone size={20} />
            {CONTACT_PHONE_DISPLAY}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-sm opacity-50">
          &copy; 2025 جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
};

export default Footer;
