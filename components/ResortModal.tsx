
import React, { useState, useEffect } from 'react';
import { 
  X, Check, Calendar, Phone, Mail, User, Send, ArrowRight,
  Mountain, Sparkles, Smile, Plane, Home, MapPin, Leaf, 
  HeartPulse, Stethoscope, Users, HandHeart, ChefHat, 
  Activity, UserCheck, Utensils, Flower2, Camera, Waves,
  Sunset, Bird, Bed, Soup, Wind, Monitor, HeartHandshake,
  Flag, Coffee, MessageCircle, Footprints, Wifi, Loader2,
  CheckCircle2, CreditCard, Clock, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resort, BookingFormData, PriceTier } from '../types';
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
      
      // Auto-scroll to top when modal opens
      const modalContainer = document.querySelector('.custom-scrollbar');
      if (modalContainer) {
        modalContainer.scrollTop = 0;
      }
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
      console.log("Attempting to save to Supabase...");
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
          
          if (error.code === '42P01' || error.message.includes('Could not find the table') || error.message.includes('relation "public.bookings" does not exist')) {
            console.warn("The 'bookings' table was not found in your Supabase project.");
          } else if (error.code === '42501') {
            console.warn("Row Level Security (RLS) policy violation.");
          }
        } else {
          console.log("✅ Booking saved to Supabase successfully.");
        }
      } catch (err) {
        console.error("Unexpected error saving to Supabase:", err);
      }
    } else {
      console.warn("Supabase is not configured with a valid API Key. Skipping database save.");
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
                
                {/* Stars - Centered now since Number is gone */}
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
          
          {/* Airport Info Banner - FIXED DESIGN */}
          {resort.airport && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 mb-12 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden group">
               {/* Header Badge */}
               <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-20">
                 أقرب مطار دولي
               </div>

               <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-orange-50/50 rounded-full blur-3xl z-0"></div>
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl z-0"></div>

               {/* Airport Identity (Right Side) */}
               <div className="flex-1 flex items-center gap-5 w-full lg:w-auto relative z-10 pt-4 lg:pt-0">
                 <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                   <Plane size={36} strokeWidth={1.5} className="transform -rotate-45" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-secondary leading-tight mb-1">{resort.airport.name}</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-4xl font-black text-blue-900 font-sans tracking-wide" dir="ltr">{resort.airport.code}</span>
                   </div>
                 </div>
               </div>
        
               {/* Divider with Arrow (Desktop) */}
               <div className="hidden lg:flex flex-col items-center justify-center opacity-20 px-4">
                  <div className="h-12 border-r-2 border-dashed border-gray-400"></div>
                  <ArrowRight className="text-gray-400 mt-2 rotate-90" size={16} />
               </div>
        
               {/* Travel Stats (Left Side - Explicit Box) */}
               <div className="w-full lg:w-auto min-w-[320px] relative z-10">
                 <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/60">
                    <div className="text-xs text-gray-500 font-bold mb-4 text-center border-b border-gray-200 pb-2">
                       تفاصيل الرحلة من المطار للمنتجع
                    </div>
                    <div className="flex items-center justify-between gap-4">
                       {/* Distance */}
                       <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <div className="text-orange-500 bg-orange-100 p-2 rounded-full mb-1">
                             <MapPin size={20} />
                          </div>
                          <span className="text-sm text-gray-400 font-medium">المسافة للمنتجع</span>
                          <span className="text-xl font-bold text-secondary" dir="ltr">{resort.airport.distance}</span>
                       </div>

                       <div className="h-10 border-l border-gray-200"></div>

                       {/* Time */}
                       <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <div className="text-orange-500 bg-orange-100 p-2 rounded-full mb-1">
                             <Clock size={20} />
                          </div>
                          <span className="text-sm text-gray-400 font-medium">الوقت بالسيارة</span>
                          <span className="text-xl font-bold text-secondary" dir="ltr">{resort.airport.time}</span>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* About Resort */}
          <div className="mb-16 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-6 relative inline-block">
              عن المنتجع
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full opacity-50"></span>
            </h2>
            <p className="text-lg text-gray-600 leading-loose">
              {resort.longDescription || resort.description}
            </p>
          </div>

          {/* Features Grid - REFACTORED FOR RESPONSIVENESS AND CLARITY */}
          {resort.features && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-secondary mb-10 text-center">مميزات المنتجع</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {resort.features.map((feature, idx) => {
                  const Icon = ICON_MAP[feature.icon] || Sparkles;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 border border-gray-50 h-full"
                    >
                      <div className="p-3 bg-cream rounded-xl text-primary shrink-0">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary text-lg mb-1">{feature.title}</h4>
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

          {/* Offer & Treatment Inclusions */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            
            {/* Offer Includes */}
            {resort.offerIncludes && (
              <div className="bg-[#fcf8f4] rounded-3xl p-8 border border-[#eaddcf]">
                 <h3 className="text-2xl font-bold text-[#8c6b4a] mb-8 text-center bg-white/50 py-2 rounded-full w-fit mx-auto px-8 border border-[#D4A373]/20">
                    العرض يشمل
                 </h3>
                 <div className="grid gap-4">
                    {resort.offerIncludes.map((item, idx) => {
                       const Icon = ICON_MAP[item.icon] || Check;
                       return (
                          <div key={idx} className="bg-[#D4A373] text-white p-4 rounded-xl shadow-sm flex items-center gap-4 hover:transform hover:scale-[1.02] transition-transform">
                             <div className="bg-white/20 p-2 rounded-full">
                                <Icon size={20} />
                             </div>
                             <span className="font-medium text-lg">{item.title}</span>
                          </div>
                       );
                    })}
                 </div>
              </div>
            )}

            {/* Treatment Includes */}
            {resort.treatmentIncludes && (
               <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-2xl font-bold text-secondary mb-8 text-center bg-gray-50 py-2 rounded-full w-fit mx-auto px-8">
                     يشمل العلاج
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                     {resort.treatmentIncludes.map((item, idx) => {
                        const Icon = ICON_MAP[item.icon] || Leaf;
                        return (
                           <div key={idx} className="flex flex-col items-center text-center gap-3 group">
                              <div className="w-16 h-16 bg-[#efebe7] rounded-full flex items-center justify-center text-[#5e5044] group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                 <Icon size={28} strokeWidth={1.5} />
                              </div>
                              <span className="text-sm font-medium text-gray-700 leading-snug">{item.title}</span>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}
          </div>

          {/* Packages Section */}
          <div id="packages-section" className="mb-16">
            <h2 className="text-4xl font-black text-secondary mb-2 text-center">البـــاقـــات</h2>
            
            {resort.packageCategories.map((category, catIdx) => (
              <div key={catIdx} className="mb-16 last:mb-0">
                 {/* Category Title with Lines */}
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-[#D4A373] flex-grow opacity-50"></div>
                    <h3 className="text-2xl md:text-3xl text-[#D4A373] font-light">{category.title}</h3>
                    <div className="h-px bg-[#D4A373] flex-grow opacity-50"></div>
                 </div>

                 {/* Packages Grid */}
                 <div className="flex flex-wrap justify-center gap-6 mb-10">
                    {category.items.map((pkg, pkgIdx) => (
                       <motion.div 
                          key={pkgIdx}
                          whileHover={{ y: -5 }}
                          className={`
                             relative w-40 md:w-48 aspect-[3/4] rounded-[2rem] 
                             flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300
                             ${selectedPlan === pkg.name 
                                ? 'bg-secondary text-white shadow-xl scale-105 z-10' 
                                : 'bg-[#eaddcf] text-secondary hover:bg-[#d4bca5]'
                             }
                          `}
                          style={{
                             borderRadius: "2rem 0.5rem 2rem 0.5rem" // Leaf-like shape
                          }}
                          onClick={() => {
                             setSelectedPlan(pkg.name);
                             // Scroll to pricing section handled in useEffect
                          }}
                       >
                          <div className="text-xs font-bold opacity-60 mb-2">باقـــة</div>
                          <h4 className="font-bold text-lg leading-tight mb-4">{pkg.name}</h4>
                          <div className="text-[10px] opacity-70 space-y-1">
                             {pkg.durations.map((d, i) => <div key={i}>{d}</div>)}
                          </div>
                          <div className="text-[10px] mt-4 opacity-60">غرفة للشخص</div>
                          <div className="text-[10px] opacity-60">غرفة للشخصين</div>
                       </motion.div>
                    ))}
                 </div>

                 {/* Pricing Tiers Block - REFACTORED FOR SINGLE/DOUBLE CLARITY */}
                 <div className="flex flex-wrap justify-center gap-6">
                    {category.priceTiers.map((tier, tierIdx) => (
                       <div key={tierIdx} className="bg-[#D4A373] rounded-xl overflow-hidden shadow-lg min-w-[300px] flex flex-col">
                          {/* Duration Header */}
                          <div className="bg-[#b58556] text-white text-center py-2 font-bold text-lg shadow-inner">
                             {tier.durationLabel}
                          </div>
                          
                          {/* Price Grid */}
                          <div className="flex divide-x divide-x-reverse divide-[#b58556]/30">
                             {/* Single Price */}
                             <div className="flex-1 p-4 flex flex-col items-center gap-2 bg-[#D4A373] hover:bg-[#c99563] transition-colors group cursor-pointer relative">
                                <div className="bg-white/20 p-2 rounded-full mb-1 group-hover:bg-white/30 transition-colors">
                                  <User size={20} className="text-white" />
                                </div>
                                <span className="text-white/80 text-xs font-bold">سنجل (لشخص)</span>
                                <span className="text-white font-black text-xl dir-ltr">{tier.priceSingle}</span>
                             </div>

                             {/* Double Price */}
                             <div className="flex-1 p-4 flex flex-col items-center gap-2 bg-[#cd9b6b] hover:bg-[#c99563] transition-colors group cursor-pointer relative">
                                <div className="bg-white/20 p-2 rounded-full mb-1 group-hover:bg-white/30 transition-colors">
                                  <Users size={20} className="text-white" />
                                </div>
                                <span className="text-white/80 text-xs font-bold">دبل (لشخصين)</span>
                                <span className="text-white font-black text-xl dir-ltr">{tier.priceDouble}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>

              </div>
            ))}
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 text-center text-sm text-gray-500 max-w-2xl mx-auto">
               ملاحظة: الأسعار الموضحة أعلاه هي أسعار استرشادية وتخضع للتغيير بناءً على توفر الغرف، الموسم، والضرائب الحكومية. الأسعار النهائية يتم تأكيدها عند التواصل وإتمام الحجز.
            </div>
          </div>

          {/* Booking Form */}
          <AnimatePresence mode="wait">
            {selectedPlan && !isSuccess && (
              <motion.div 
                id="booking-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-gray-50 max-w-3xl mx-auto"
              >
                {/* Header */}
                <div className="bg-white p-8 text-center border-b border-gray-100">
                  <h3 className="text-3xl font-bold text-secondary mb-2">إكمال الحجز</h3>
                  <p className="text-primary font-bold text-lg">لقد اخترت: {selectedPlan}</p>
                </div>

                {/* Stepper */}
                <div className="flex justify-center items-center py-8 px-6 bg-white">
                   <div className="flex items-center w-full max-w-md relative">
                      {/* Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -z-0"></div>
                      <div className="absolute top-1/2 left-0 right-1/2 h-1 bg-[#D4A373] -z-0"></div>
                      
                      {/* Steps */}
                      <div className="w-full flex justify-between z-10">
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-bold text-sm">1</div>
                            <span className="text-[10px] font-bold text-[#D4A373]">اختيار الباقة</span>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-bold text-sm">2</div>
                            <span className="text-[10px] font-bold text-[#D4A373]">التفاصيل</span>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm">3</div>
                            <span className="text-[10px] font-bold text-gray-400">التأكيد</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 md:p-12 bg-white">
                  <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* Step 1: Duration & Room Type */}
                    <div className="bg-cream rounded-3xl p-6 border border-[#eaddcf]/30 shadow-sm">
                       <div className="grid md:grid-cols-2 gap-8">
                          {/* Duration */}
                          <div className="space-y-3">
                             <label className="text-sm font-bold text-secondary mr-2">مدة الإقامة:</label>
                             <div className="flex gap-3">
                                {priceTiers.map((tier) => (
                                   <button
                                      type="button"
                                      key={tier.durationLabel}
                                      onClick={() => setSelectedDuration(tier.durationLabel)}
                                      className={`
                                         flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all relative overflow-hidden
                                         ${selectedDuration === tier.durationLabel 
                                            ? 'border-secondary bg-secondary text-white shadow-md' 
                                            : 'border-white bg-white text-gray-500 hover:border-gray-200'}
                                      `}
                                   >
                                      {tier.durationLabel}
                                      {selectedDuration === tier.durationLabel && (
                                         <div className="absolute top-0 right-0 bg-white/20 p-1 rounded-bl-lg">
                                            <Check size={10} className="text-white" />
                                         </div>
                                      )}
                                   </button>
                                ))}
                             </div>
                          </div>

                          {/* Room Type */}
                          <div className="space-y-3">
                             <label className="text-sm font-bold text-secondary mr-2">نوع الغرفة:</label>
                             <div className="flex gap-3">
                                <button
                                   type="button"
                                   onClick={() => setSelectedRoomType('single')}
                                   className={`
                                      flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2
                                      ${selectedRoomType === 'single' 
                                         ? 'border-secondary bg-secondary text-white shadow-md' 
                                         : 'border-white bg-white text-gray-500 hover:border-gray-200'}
                                   `}
                                >
                                   <User size={16} /> سنجل
                                </button>
                                <button
                                   type="button"
                                   onClick={() => setSelectedRoomType('double')}
                                   className={`
                                      flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2
                                      ${selectedRoomType === 'double' 
                                         ? 'border-secondary bg-secondary text-white shadow-md' 
                                         : 'border-white bg-white text-gray-500 hover:border-gray-200'}
                                   `}
                                >
                                   <Users size={16} /> دبل
                                </button>
                             </div>
                          </div>
                       </div>

                       {/* Price Display */}
                       {calculatedPrice && (
                          <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                             <span className="text-gray-500 font-medium text-sm">التكلفة التقديرية للباقة:</span>
                             <span className="text-2xl font-black text-[#D4A373] dir-ltr">{calculatedPrice}</span>
                          </div>
                       )}
                    </div>

                    {/* Step 2: Personal Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2 group">
                        <label className="text-sm font-bold text-gray-600 mr-2 group-focus-within:text-primary transition-colors">الاسم الكريم</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            name="name" 
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full h-14 pr-12 pl-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#D4A373]/30 focus:ring-4 focus:ring-[#D4A373]/10 outline-none transition-all font-medium text-secondary"
                            placeholder="مسعود عبدالفتاح"
                          />
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                      </div>

                      <div className="space-y-2 group">
                        <label className="text-sm font-bold text-gray-600 mr-2 group-focus-within:text-primary transition-colors">رقم الجوال</label>
                        <div className="relative">
                           <input 
                            type="tel" 
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full h-14 pr-12 pl-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#D4A373]/30 focus:ring-4 focus:ring-[#D4A373]/10 outline-none transition-all font-medium text-secondary text-left"
                            placeholder="+966507704772"
                            dir="ltr"
                          />
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                      </div>

                      <div className="space-y-2 group">
                        <label className="text-sm font-bold text-gray-600 mr-2 group-focus-within:text-primary transition-colors">البريد الإلكتروني</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full h-14 pr-12 pl-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#D4A373]/30 focus:ring-4 focus:ring-[#D4A373]/10 outline-none transition-all font-medium text-secondary"
                            placeholder="drrak.sa@gmail.com"
                          />
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                      </div>

                      <div className="space-y-2 group">
                        <label className="text-sm font-bold text-gray-600 mr-2 group-focus-within:text-primary transition-colors">تاريخ السفر المقترح</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full h-14 pr-12 pl-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#D4A373]/30 focus:ring-4 focus:ring-[#D4A373]/10 outline-none transition-all font-medium text-secondary"
                          />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 rounded-2xl bg-[#D4A373] text-white text-xl font-bold hover:bg-[#c08d5e] transition-all transform hover:scale-[1.01] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send size={22} className="transform rotate-180" />
                          إرسال الطلب
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-xs text-gray-400 mt-4">
                      سيتم توجيهك إلى تطبيق واتساب لإرسال بيانات الحجز والتواصل مع خدمة العملاء
                    </p>
                  </form>
                </div>
              </motion.div>
            )}
            
            {/* Success View */}
            {isSuccess && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2.5rem] shadow-2xl p-12 text-center max-w-2xl mx-auto border-4 border-green-50"
               >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                     <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-bold text-secondary mb-4">تم إرسال طلبك</h3>
                  <p className="text-xl text-gray-600 mb-8 font-light">
                    استعد لتجربة استشفاء فريدة.. رحلة الأيورفيدا تبدأ الآن
                  </p>
                  
                  <button 
                     onClick={handleWhatsAppRedirect}
                     className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                     <Send className="transform rotate-180" size={20} />
                     متابعة عبر واتساب
                  </button>
               </motion.div>
            )}
          </AnimatePresence>

        </div>
    </motion.div>
  );
};

export default ResortModal;
