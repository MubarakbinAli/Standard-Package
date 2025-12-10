
import React from 'react';
import { Phone, Lock } from 'lucide-react';
import { CONTACT_PHONE_DISPLAY } from '../lib/constants';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="bg-darkbrown text-white py-12 mt-20 relative">
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

        <div className="mt-12 pt-8 border-t border-white/10 text-sm opacity-50 flex justify-center items-center gap-2">
          <span>&copy; 2025 جميع الحقوق محفوظة</span>
          {onAdminClick && (
            <button 
              onClick={onAdminClick} 
              className="opacity-40 hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-white/10"
              aria-label="Admin Login"
              title="الدخول للإدارة"
            >
              <Lock size={14} />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
