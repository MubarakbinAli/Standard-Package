
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, Flame, Droplets, Leaf, Utensils, 
  Activity, Clock, AlertTriangle, Flower2, HeartPulse, ArrowRight, Sparkles 
} from 'lucide-react';

interface AyurvedaPageProps {
  onBack: () => void;
}

const AyurvedaPage: React.FC<AyurvedaPageProps> = ({ onBack }) => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] font-sans text-secondary">
      
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-secondary hover:text-primary transition-colors font-bold group"
          >
            <div className="w-10 h-10 rounded-full bg-cream group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <ArrowRight size={20} className="transform group-hover:-translate-x-1 transition-transform" />
            </div>
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-8 text-primary border border-primary/10"
          >
            <Flower2 size={48} strokeWidth={1.5} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-secondary mb-8 leading-tight"
          >
            فلسفة الأيورفيدا<br/>
            <span className="text-primary font-light text-3xl md:text-5xl">فن العيش بتوازن</span>
          </motion.h1>
          
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-lg md:text-xl text-gray-600 leading-loose max-w-2xl mx-auto"
          >
            طب هندي قديم يمتد لآلاف السنين، لا يعالج المرض فحسب، بل يرسم لك أسلوب حياة متكامل يجمع بين غذاء الروح، وصفاء العقل، وصحة الجسد.
          </motion.p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-20">
        
        {/* Section 1: Definition (Card Style) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10"
        >
          <div className="flex-1 space-y-6">
             <h2 className="text-3xl font-bold flex items-center gap-3">
               <Sparkles className="text-primary" />
               ما هي الأيورفيدا؟
             </h2>
             <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
               <p>
                 كلمة <span className="text-primary font-bold">Ayurveda</span> تعني حرفياً "علم الحياة". نشأت في الهند قبل أكثر من 5000 سنة، وتعتمد مبدأ أن الصحة هي حالة من التوازن الديناميكي بين البيئة والجسد والروح.
               </p>
               <div className="p-4 bg-cream rounded-xl border-r-4 border-primary text-base italic">
                 "ليست مجرد طب بديل، بل هي نظام حياة وقائي وعلاجي متكامل يُستخدم جنباً إلى جنب مع الطب الحديث."
               </div>
             </div>
          </div>
          {/* Visual abstract shape/image placeholder */}
          <div className="w-full md:w-1/3 h-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-[2rem] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <Leaf size={120} className="text-primary opacity-20" />
          </div>
        </motion.div>

        {/* Section 2: Doshas (3 Cards Grid) */}
        <motion.div
           variants={container}
           initial="hidden"
           whileInView="show"
           viewport={{ once: true }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">طاقات الجسم الثلاث (الدوشا)</h2>
            <p className="text-gray-500">وفقاً للأيورفيدا، يتكون كل إنسان من مزيج فريد من ثلاث طاقات حيوية</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Vata */}
            <motion.div variants={item} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-md transition-all hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Wind size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-secondary">فاتا (Vata)</h3>
              <div className="h-1 w-12 bg-blue-200 rounded-full mb-4"></div>
              <p className="text-gray-500 leading-relaxed">
                طاقة <strong>الحركة</strong>. ترتبط بعنصر الهواء والأثير. مسؤولة عن التنفس، نبض القلب، وحركة العضلات والأعصاب.
              </p>
            </motion.div>

            {/* Pitta */}
            <motion.div variants={item} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-md transition-all hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Flame size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-secondary">بيتا (Pitta)</h3>
              <div className="h-1 w-12 bg-orange-200 rounded-full mb-4"></div>
              <p className="text-gray-500 leading-relaxed">
                طاقة <strong>التحول</strong>. ترتبط بعنصر النار والماء. تتحكم في الهضم، التمثيل الغذائي (الأيض)، وذكاء الجسم وحرارته.
              </p>
            </motion.div>

            {/* Kapha */}
            <motion.div variants={item} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-md transition-all hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Droplets size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-secondary">كافا (Kapha)</h3>
              <div className="h-1 w-12 bg-green-200 rounded-full mb-4"></div>
              <p className="text-gray-500 leading-relaxed">
                طاقة <strong>البناء</strong>. ترتبط بعنصر الأرض والماء. تمنح الجسم بنيته، قوته، مناعته، وترطيب المفاصل والجلد.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Section 3: Treatments (Dark Luxury Card) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-secondary text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10">
            <div className="text-center mb-12">
               <h2 className="text-3xl md:text-4xl font-bold mb-4">رحلة العلاج والاستشفاء</h2>
               <p className="text-white/70 max-w-2xl mx-auto">تعتمد الأيورفيدا على منهجية شاملة لا تكتفي بالأعراض بل تبحث عن الجذور</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                        <Leaf size={24} />
                     </div>
                     <div>
                        <h4 className="text-xl font-bold text-primary mb-2">الأعشاب والزيوت</h4>
                        <p className="text-white/70 text-sm leading-relaxed">استخدام تركيبات عشبية وزيوت طبية دافئة مخصصة لكل حالة لتعزيز الشفاء العميق.</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                        <Utensils size={24} />
                     </div>
                     <div>
                        <h4 className="text-xl font-bold text-primary mb-2">الغذاء كدواء</h4>
                        <p className="text-white/70 text-sm leading-relaxed">أنظمة غذائية دقيقة تعيد التوازن للدوشا المختلة، فما يناسب الفاتا قد يضر البيتا.</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                        <Activity size={24} />
                     </div>
                     <div>
                        <h4 className="text-xl font-bold text-primary mb-2">البانشاكارما</h4>
                        <p className="text-white/70 text-sm leading-relaxed">عمليات تطهير عميقة لإخراج السموم المتراكمة في الجسم عبر المساج والبخار وغيرها.</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                        <Clock size={24} />
                     </div>
                     <div>
                        <h4 className="text-xl font-bold text-primary mb-2">نمط الحياة</h4>
                        <p className="text-white/70 text-sm leading-relaxed">ضبط الساعة البيولوجية، النوم المبكر، اليوغا، والتأمل لتهدئة العقل.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Note */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4 items-start">
            <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-amber-800 mb-2">تنويه هام</h4>
              <p className="text-amber-900/70 text-sm leading-relaxed">
                تهدف هذه البرامج لتحسين جودة الحياة والوقاية. في الحالات المرضية المزمنة، يجب دائماً استشارة الطبيب المختص قبل البدء في أي برنامج علاجي مكثف، حيث أن بعض الأعشاب قد تتفاعل مع الأدوية الطبية.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AyurvedaPage;
