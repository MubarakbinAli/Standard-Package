
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Calendar, CheckCircle2, Clock, CreditCard, Loader2, 
  Mail, MapPin, Phone, Plane, Send, Sparkles, User, UserCheck, Users, 
  X, Check, Mountain, Smile, Home, Leaf, HeartPulse, Stethoscope, 
  HandHeart, ChefHat, Activity, Utensils, Flower2, Camera, Waves, 
  Sunset, Bird, Bed, Soup, Wind, Monitor, HeartHandshake, Flag, 
  Coffee, MessageCircle, Footprints, Wifi 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resort, BookingFormData } from '../types';
import { CONTACT_PHONE } from '../constants';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

// Icon mapping for dynamic rendering
const ICON_MAP: { [key: string]: React.ElementType } = {
  'mountain': Mountain,
  'sparkles': Sparkles,
  'smile': Smile,
  'plane': Plane,
  'home': Home,
  'map-pin': MapPin,
  'leaf': Leaf,
  'heart-pulse': HeartPulse,
  'stethoscope': Stethoscope,
  'users': Users,
  'hand-heart': HandHeart,
  'chef-hat': ChefHat,
  'activity': Activity,
  'user-check': UserCheck,
  'utensils': Utensils,
  'flower-2': Flower2,
  'camera': Camera,
  'waves': Waves,
  'sunset': Sunset,
  'bird': Bird,
  'bed': Bed,
  'soup': Soup,
  'wind': Wind,
  'monitor': Monitor,
  'heart-handshake': HeartHandshake,
  'flag': Flag,
  'coffee': Coffee,
  'message-circle': MessageCircle,
  'footprints': Footprints,
  'wifi': Wifi
};

interface ResortModalProps {
  resort: Resort | null;
  onClose: () => void;
}

const ResortModal: React.FC<ResortModalProps> = ({ resort, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<'single' | 'double'>('single');
  const [calculatedPrice, setCalculatedPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    email: '',
    date: '',
    plan: ''
  });

  // Reset state when resort changes
  useEffect(() => {
    if (resort) {
      setSelectedPlan(null);
      setSelectedDuration('');
      setSelectedRoomType('single');
      setCalculatedPrice('');
      setFormData({ name: '', phone: '', email: '', date: '', plan: '' });
      setIsSubmitting(false);
      setIsSuccess(false);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [resort]);

  // Find the category and pricing tiers for the selected plan
  const currentCategory = resort?.packageCategories.find(cat => 
    cat.items.some(item => item.name === selectedPlan)
  );
  const priceTiers = currentCategory?.priceTiers || [];

  // Initialize duration when plan is selected
  useEffect(() => {
    if (selectedPlan && priceTiers.length > 0) {
      // Default to the first duration option (usually 7 nights)
      const defaultDuration = priceTiers[0].durationLabel;
      setSelectedDuration(defaultDuration);
      
      setFormData(prev => ({ ...prev, plan: `${resort?.name} - ${selectedPlan}` }));
      
      const formElement = document.getElementById('booking-form');
      if (formElement) {
        setTimeout(() => formElement.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [selectedPlan, resort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate Price whenever dependencies change
  useEffect(() => {
    if (!selectedDuration || priceTiers.length === 0) return;

    const tier = priceTiers.find(t => t.durationLabel === selectedDuration);
    if (tier) {
      const price = selectedRoomType === 'single' ? tier.priceSingle : tier.priceDouble;
      setCalculatedPrice(price);
    }
  }, [selectedDuration, selectedRoomType, priceTiers]);


  const scrollToPackages = () => {
    const element = document.getElementById('packages-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getWhatsAppUrl = () => {
     const roomTypeText = selectedRoomType === 'single' ? 'سنجل (فردية)' : 'دبل (مزدوجة)';
     const message = `مرحباً، أرغب بحجز باقة جديدة:%0a📋 الباقة: ${formData.plan}%0a⏳ المدة: ${selectedDuration}%0a🛏 نوع الغرفة: ${roomTypeText}%0a💰 السعر التقديري: ${calculatedPrice}%0a👤 الاسم: ${formData.name}%0a📱 الجوال: ${formData.phone}%0a📧 الإيميل: ${formData.email}%0a📅 التاريخ المقترح: ${formData.date}`;
     return `https://wa.me/${CONTACT_PHONE}?text=${message}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Attempt to save to Supabase (if configured)
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('bookings')
          .insert([
            {
              name: formData.name,
              phone: formData.phone,
              email: formData.email,
              date: formData.date,
              plan: formData.plan,
              resort_name: resort?.name,
              duration: selectedDuration,
              room_type: selectedRoomType,
              price: calculatedPrice,
            },
          ]);

        if (error) {
          console.error("❌ Supabase Insert Error:", JSON.stringify(error));
        } else {
          console.log("✅ Booking saved to Supabase successfully.");
        }
      } catch (err) {
        console.error("Unexpected error saving to Supabase:", err);
      }
    }

    // 2. Set success state to show confirmation UI
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleWhatsAppRedirect = () => {
    const url = getWhatsAppUrl();
    window.open(url, '_blank');
  };

  if (!resort) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 bg-cream overflow-y-auto custom-scrollbar"
      >
        {/* Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-6 shadow-sm">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-bold"
          >
            <ArrowRight size={20} />
            <span>العودة للقائمة</span>
          </button>
          <span className="text-lg font-bold text-secondary hidden md:block">{resort.name}</span>
          <button 
             onClick={scrollToPackages}
             className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#c08d5e] transition-colors"
          >
            احجز الآن
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative h-[60vh] w-full">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${resort.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white max-w-6xl mx-auto flex flex-col items-center text-center">
             
             {/* Sticker Badge Container */}
             <div className="relative mb-6">
                {/* Stars */}
                <div className="flex gap-1 justify-center text-white drop-shadow-md">
                   {[...Array(resort.stars || 5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 md:w-6 md:h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                   ))}
                </div>
                {/* Luxury Label */}
                <div className="text-white text-lg font-serif mt-1 drop-shadow-sm">
                   luxury / <span className="font-sans">لكجري</span>
                </div>
             </div>

            <h1 className="text-4xl md:text-6xl font-black mb-2 drop-shadow-lg font-serif tracking-wide">{resort.name}</h1>
            <p className="text-xl md:text-2xl opacity-90 font-light font-sans tracking-wide">
              {resort.location}
            </p>

            {/* Booking.com Badge */}
            {resort.bookingScore && (
              <div className="absolute bottom-0 left-0 md:left-8 bg-[#003580] text-white p-1 rounded-t-lg shadow-lg flex items-center gap-2 border-2 border-white/20">
                 <div className="bg-white text-[#003580] font-bold px-1.5 rounded text-sm">Booking.com</div>
                 <div className="font-bold text-lg px-2">{resort.bookingScore}</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          
          {/* Airport Info Banner - Modern White Card Design with Icons */}
          {resort.airport && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

               {/* Airport Identity (Right Side) */}
               <div className="flex-1 flex items-center gap-6 w-full md:w-auto relative z-10">
                 <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                   <Plane size={32} strokeWidth={1.5} className="transform -rotate-45" />
                 </div>
                 <div>
                   <span className="text-gray-400 text-sm font-bold block mb-1">أقرب مطار</span>
                   <h3 className="text-xl font-bold text-secondary leading-tight mb-1">{resort.airport.name}</h3>
                   <div className="text-3xl font-black text-blue-900 font-sans tracking-wider" dir="ltr">{resort.airport.code}</div>
                 </div>
               </div>
        
               {/* Divider (Desktop) */}
               <div className="hidden md:block w-px h-16 bg-gray-100"></div>
        
               {/* Travel Stats (Left Side) */}
               <div className="flex items-center gap-8 w-full md:w-auto justify-around md:justify-start relative z-10">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                     <MapPin size={24} />
                   </div>
                   <div>
                     <span className="text-gray-400 text-xs font-bold block">المسافة للمنتجع</span>
                     <span className="text-lg font-bold text-secondary" dir="ltr">{resort.airport.distance}</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                     <Clock size={24} />
                   </div>
                   <div>
                     <span className="text-gray-400 text-xs font-bold block">الوقت بالسيارة</span>
                     <span className="text-lg font-bold text-secondary" dir="ltr">{resort.airport.time}</span>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-16 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-6">عن المنتجع</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {resort.longDescription || resort.description}
            </p>
          </div>

          {/* Features Grid */}
          {resort.features && (
            <div className="mb-20">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-secondary">مميزات المنتجع</h2>
                <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {resort.features.map((feature, idx) => {
                  const Icon = ICON_MAP[feature.icon] || Sparkles;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                      className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100/50 hover:border-[#D4A373]/30"
                    >
                      <div className="bg-[#D4A373]/10 p-3.5 rounded-xl text-[#D4A373] shrink-0 mt-0.5">
                        <Icon size={28} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary text-lg leading-snug mb-2">{feature.title}</h4>
                        {feature.description && (
                          <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Offer Includes (Gold Cards) */}
          {resort.offerIncludes && (
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-secondary">العرض يشمل</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resort.offerIncludes.map((item, idx) => {
                  const Icon = ICON_MAP[item.icon] || Check;
                  return (
                    <div key={idx} className="bg-[#D4A373] text-white p-5 rounded-2xl flex items-center gap-4 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="bg-white/20 p-2 rounded-full shrink-0">
                        <Icon size={24} />
                      </div>
                      <span className="font-bold leading-tight text-sm md:text-base">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Treatment Includes (Icon Grid) */}
          {resort.treatmentIncludes && (
            <div className="mb-20">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-secondary">يشمل العلاج</h3>
                <div className="w-16 h-1 bg-primary mx-auto mt-3 rounded-full opacity-50"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {resort.treatmentIncludes.map((item, idx) => {
                  const Icon = ICON_MAP[item.icon] || Leaf;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center group">
                      <div className="bg-[#f0e6da] p-4 rounded-full text-secondary mb-3 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Icon size={32} strokeWidth={1.5} />
                      </div>
                      <span className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Packages & Prices Section */}
          <div id="packages-section" className="bg-white/50 rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-secondary mb-3">الباقات</h2>
            </div>

            <div className="space-y-16">
              {resort.packageCategories.map((category, catIdx) => (
                <div key={catIdx}>
                  {/* Category Title with Lines */}
                  <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-px bg-[#D4A373] w-16 md:w-32 opacity-50"></div>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#D4A373]">{category.title}</h3>
                    <div className="h-px bg-[#D4A373] w-16 md:w-32 opacity-50"></div>
                  </div>

                  {/* Package Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {category.items.map((pkg, i) => (
                       <div 
                         key={i}
                         onClick={() => setSelectedPlan(pkg.name)}
                         className={`relative p-6 rounded-[2rem] text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                           selectedPlan === pkg.name 
                             ? 'bg-primary text-white shadow-xl scale-105 z-10' 
                             : 'bg-[#fdf8f3] text-secondary hover:shadow-md border border-[#eee6db]'
                         }`}
                       >
                         {/* Wavy shape decoration - simpler version */}
                         <div className="text-xs font-light mb-1 opacity-80">باقة</div>
                         <h4 className="font-bold text-lg mb-4 leading-tight">{pkg.name}</h4>
                         <div className="flex flex-col gap-1 text-xs opacity-70">
                           {pkg.durations.map((d, di) => (
                             <span key={di}>{d}</span>
                           ))}
                         </div>
                         <div className="mt-4 text-xs font-medium opacity-60">غرفة لشخص / غرفة لشخصين</div>
                       </div>
                    ))}
                  </div>

                  {/* Pricing Tiers Block - Refactored Design */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                     {category.priceTiers.map((tier, tIdx) => (
                        <div key={tIdx} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                           {/* Duration Header */}
                           <div className="bg-secondary text-white py-3 px-4 text-center">
                              <span className="font-bold text-lg">{tier.durationLabel}</span>
                           </div>
                           
                           {/* Prices Grid */}
                           <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100">
                              {/* Single */}
                              <div className="p-4 text-center group hover:bg-gray-50 transition-colors">
                                 <div className="text-primary mb-2 flex justify-center">
                                    <User size={24} />
                                 </div>
                                 <div className="text-gray-500 text-xs font-bold mb-1">سنجل (لشخص)</div>
                                 <div className="text-gray-400 text-[10px] mb-2 font-light">Single Room</div>
                                 <div className="text-secondary font-black text-lg md:text-xl dir-ltr">{tier.priceSingle}</div>
                              </div>
                              
                              {/* Double */}
                              <div className="p-4 text-center group hover:bg-gray-50 transition-colors">
                                 <div className="text-primary mb-2 flex justify-center">
                                    <Users size={24} />
                                 </div>
                                 <div className="text-gray-500 text-xs font-bold mb-1">دبل (لشخصين)</div>
                                 <div className="text-gray-400 text-[10px] mb-2 font-light">Double Room</div>
                                 <div className="text-secondary font-black text-lg md:text-xl dir-ltr">{tier.priceDouble}</div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Disclaimer */}
            <div className="mt-12 bg-gray-50 border border-gray-100 rounded-xl p-4 text-center text-gray-500 text-xs md:text-sm">
               ملاحظة: الأسعار الموضحة أعلاه هي أسعار استرشادية وتخضع للتغيير بناءً على توفر الغرف، الموسم، والضرائب الحكومية. الأسعار النهائية يتم تأكيدها عند التواصل وإتمام الحجز.
            </div>
          </div>

          {/* Booking Form */}
          <div id="booking-form" className={`mt-10 pt-10 border-t-2 border-dashed border-gray-200 ${!selectedPlan ? 'opacity-50 pointer-events-none filter blur-sm transition-all duration-500' : 'opacity-100 filter-none'}`}>
             
             {/* Form Header with Progress */}
             <div className="mb-10 text-center bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-3xl font-bold text-secondary mb-2">إكمال الحجز</h3>
                <div className="text-gray-500 mb-8 bg-gray-50 inline-block px-4 py-2 rounded-lg text-sm">
                   {selectedPlan ? (
                     <span>لقد اخترت: <strong className="text-primary">{selectedPlan}</strong></span>
                   ) : (
                     "الرجاء اختيار باقة من الأعلى للبدء"
                   )}
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center max-w-lg mx-auto">
                   <div className="flex flex-col items-center relative z-10">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">1</div>
                      <span className="text-xs font-bold mt-2 text-primary">اختيار الباقة</span>
                   </div>
                   <div className="h-0.5 flex-1 bg-gray-100 mx-2 -mt-4">
                      <div className="h-full bg-primary w-full"></div>
                   </div>
                   <div className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white transition-colors ${selectedPlan ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                      <span className={`text-xs font-bold mt-2 ${selectedPlan ? 'text-primary' : 'text-gray-400'}`}>التفاصيل</span>
                   </div>
                   <div className="h-0.5 flex-1 bg-gray-100 mx-2 -mt-4">
                      <div className={`h-full bg-primary transition-all duration-500 ${isSuccess ? 'w-full' : 'w-0'}`}></div>
                   </div>
                   <div className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white transition-colors ${isSuccess ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
                      <span className={`text-xs font-bold mt-2 ${isSuccess ? 'text-primary' : 'text-gray-400'}`}>التأكيد</span>
                   </div>
                </div>
             </div>

             <div className="max-w-4xl mx-auto">
                
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100"
                  >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                      <CheckCircle2 size={56} />
                    </div>
                    <h3 className="text-3xl font-bold text-secondary mb-4">تم إرسال طلبك</h3>
                    <p className="text-gray-600 text-xl mb-10 max-w-lg font-medium leading-relaxed">
                      "استعد لتجربة استشفاء فريدة.. رحلة الأيورفيدا تبدأ الآن"
                    </p>
                    <button 
                      onClick={handleWhatsAppRedirect}
                      className="bg-[#25D366] text-white font-bold text-lg py-4 px-10 rounded-2xl hover:bg-[#128C7E] transition-all shadow-xl hover:shadow-green-500/30 flex items-center gap-3 transform hover:-translate-y-1"
                    >
                      <Send size={22} className="rotate-0" />
                      <span>متابعة عبر واتساب</span>
                    </button>
                    <p className="text-sm text-gray-400 mt-6">
                      اضغط على الزر أعلاه لإتمام الحجز عبر واتساب
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative">
                    {/* Customization Options */}
                    {selectedPlan && (
                      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 transition-all hover:shadow-md">
                        <h4 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                           <Sparkles size={20} className="text-primary" />
                           تخصيص الباقة
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Duration Selection */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-600 block">مدة الإقامة</label>
                                <div className="flex gap-3">
                                  {priceTiers.map((tier, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedDuration(tier.durationLabel)}
                                        className={`relative flex-1 py-4 px-4 rounded-2xl text-sm font-bold border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                                            selectedDuration === tier.durationLabel
                                            ? 'bg-primary/5 border-primary text-primary'
                                            : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200'
                                        }`}
                                      >
                                        {selectedDuration === tier.durationLabel && (
                                            <div className="absolute top-2 right-2 text-primary">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                        <Calendar size={20} className={selectedDuration === tier.durationLabel ? "opacity-100" : "opacity-50"} />
                                        {tier.durationLabel}
                                      </button>
                                  ))}
                                </div>
                            </div>

                            {/* Room Type Selection */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-600 block">نوع الغرفة</label>
                                <div className="flex gap-3">
                                  <button
                                      type="button"
                                      onClick={() => setSelectedRoomType('single')}
                                      className={`relative flex-1 py-4 px-4 rounded-2xl text-sm font-bold border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                                        selectedRoomType === 'single'
                                        ? 'bg-primary/5 border-primary text-primary'
                                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200'
                                      }`}
                                  >
                                      {selectedRoomType === 'single' && (
                                        <div className="absolute top-2 right-2 text-primary">
                                            <CheckCircle2 size={16} />
                                        </div>
                                      )}
                                      <User size={20} className={selectedRoomType === 'single' ? "opacity-100" : "opacity-50"} />
                                      سنجل
                                  </button>
                                  <button
                                      type="button"
                                      onClick={() => setSelectedRoomType('double')}
                                      className={`relative flex-1 py-4 px-4 rounded-2xl text-sm font-bold border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                                        selectedRoomType === 'double'
                                        ? 'bg-primary/5 border-primary text-primary'
                                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200'
                                      }`}
                                  >
                                      {selectedRoomType === 'double' && (
                                        <div className="absolute top-2 right-2 text-primary">
                                            <CheckCircle2 size={16} />
                                        </div>
                                      )}
                                      <Users size={20} className={selectedRoomType === 'double' ? "opacity-100" : "opacity-50"} />
                                      دبل
                                  </button>
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="mt-8 p-6 bg-secondary/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-secondary/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                     <div className="text-sm text-gray-500 font-medium">التكلفة التقديرية</div>
                                     <div className="text-xs text-gray-400">شاملة الضرائب والرسوم</div>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-primary dir-ltr">
                                 {calculatedPrice || "---"}
                            </div>
                        </div>
                      </div>
                    )}

                    {/* Personal Details */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h4 className="text-xl font-bold text-secondary mb-8 flex items-center gap-2">
                            <UserCheck size={20} className="text-primary" />
                            بيانات التواصل
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="group space-y-3">
                              <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary transition-colors">الاسم الكريم</label>
                              <div className="relative">
                                <User className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input 
                                  type="text" 
                                  name="name"
                                  required
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className="w-full pr-14 pl-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium"
                                  placeholder="الاسم الثلاثي"
                                />
                              </div>
                            </div>
                            
                            <div className="group space-y-3">
                              <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary transition-colors">رقم الجوال</label>
                              <div className="relative">
                                <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input 
                                  type="tel" 
                                  name="phone"
                                  required
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  className="w-full pr-14 pl-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium text-right"
                                  placeholder="05xxxxxxxx"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="group space-y-3">
                              <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary transition-colors">البريد الإلكتروني</label>
                              <div className="relative">
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input 
                                  type="email" 
                                  name="email"
                                  required
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  className="w-full pr-14 pl-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium"
                                  placeholder="example@mail.com"
                                />
                              </div>
                            </div>

                            <div className="group space-y-3">
                              <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary transition-colors">تاريخ السفر المقترح</label>
                              <div className="relative">
                                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input 
                                  type="date" 
                                  name="date"
                                  required
                                  value={formData.date}
                                  onChange={handleInputChange}
                                  className="w-full pr-14 pl-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium"
                                />
                              </div>
                            </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={isSubmitting || !selectedPlan}
                          className="w-full bg-primary text-white font-bold text-lg py-5 rounded-2xl hover:bg-[#c08d5e] transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin" />
                              جاري المعالجة...
                            </>
                          ) : (
                            <>
                              <span>إرسال الطلب</span>
                              <Send size={22} className="rotate-180" />
                            </>
                          )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-6">
                          سيتم حفظ بياناتك وإرشادك إلى واتساب لإكمال الحجز
                        </p>
                    </div>
                  </form>
                )}
             </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResortModal;
