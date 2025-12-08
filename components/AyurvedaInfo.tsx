
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, Flame, Droplets, Leaf, Utensils, 
  Activity, Clock, AlertTriangle, Flower2, HeartPulse 
} from 'lucide-react';

const AyurvedaInfo: React.FC = () => {
  return (
    <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto my-8">
      
      {/* Main Heading */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          تعرف أكثر عن الأيورفيدا
        </h2>
        <div className="h-1 w-24 bg-primary mx-auto rounded-full mb-6"></div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          الأيورفيدا (Ayurveda) طب تقليدي هندي قديم يركز على التوازن بين الجسم والعقل والروح للحفاظ على الصحة والوقاية من الأمراض. لا يعتمد فقط على الأدوية بل يشمل أسلوب حياة كامل من غذاء، وأعشاب، وتمارين، وتأمل، وعادات يومية.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Right Column: Definition & Doshas */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* What is Ayurveda */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cream rounded-full text-primary">
                <Flower2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-secondary">ما هي الأيورفيدا؟</h3>
            </div>
            <ul className="space-y-3 text-gray-600 leading-relaxed list-disc list-inside marker:text-primary">
              <li>كلمة "Ayurveda" معناها علم الحياة أو فن العيش بصحة.</li>
              <li>نشأت في الهند قبل أكثر من 4000–5000 سنة ولا تزال تُمارس هناك وفي دول أخرى حتى اليوم.</li>
              <li>تعتبر من أنظمة "الطب البديل/التكميلي" وليست بديلاً كاملاً عن الطب الحديث، بل تُستخدم غالباً معه.</li>
            </ul>
          </motion.div>

          {/* The Doshas (Energies) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold text-secondary mb-6 text-center lg:text-right">
              الفكرة الأساسية: التوازن بين الطاقات (الدوشا)
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Vata */}
              <div className="bg-[#f8fcfd] border border-blue-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Wind size={24} />
                </div>
                <h4 className="font-bold text-lg mb-2 text-secondary">فاتا (Vata)</h4>
                <p className="text-sm text-gray-500">مرتبطة بالحركة والهواء، مثل حركة الأعصاب والتنفس.</p>
              </div>

              {/* Pitta */}
              <div className="bg-[#fff9f2] border border-orange-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
                  <Flame size={24} />
                </div>
                <h4 className="font-bold text-lg mb-2 text-secondary">بيتا (Pitta)</h4>
                <p className="text-sm text-gray-500">مرتبطة بالنار والهضم والطاقة والتحولات في الجسم.</p>
              </div>

              {/* Kapha */}
              <div className="bg-[#f4f9f4] border border-green-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <Droplets size={24} />
                </div>
                <h4 className="font-bold text-lg mb-2 text-secondary">كافا (Kapha)</h4>
                <p className="text-sm text-gray-500">مرتبطة بالماء والأرض، تعطي ثباتاً ورطوبة للجسم والمناعة.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center bg-cream p-3 rounded-lg border border-primary/20">
              يُعتقد أن مرض الشخص يبدأ عندما تختلّ نسبة هذه الطاقات ويتجه العلاج لإرجاعها للتوازن.
            </p>
          </motion.div>
        </div>

        {/* Left Column: Treatments & Benefits */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Treatments */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-secondary text-white rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Leaf className="text-primary" />
              أدوات العلاج في الأيورفيدا
            </h3>
            
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Leaf className="text-primary shrink-0 mt-1" size={18} />
                <span className="opacity-90 text-sm">الأعشاب والنباتات الطبية وزيوت طبيعية خاصة لكل مشكلة.</span>
              </li>
              <li className="flex gap-3">
                <Utensils className="text-primary shrink-0 mt-1" size={18} />
                <span className="opacity-90 text-sm">تغييرات في الغذاء حسب نوع جسمك (دوشا)، أطعمة مهدئة أو منشطة.</span>
              </li>
              <li className="flex gap-3">
                <Activity className="text-primary shrink-0 mt-1" size={18} />
                <span className="opacity-90 text-sm">مساجات زيتية، حمامات بخار، تنظيف للجسم (بانشاكارما)، ويوغا.</span>
              </li>
              <li className="flex gap-3">
                <Clock className="text-primary shrink-0 mt-1" size={18} />
                <span className="opacity-90 text-sm">روتين يومي منتظم: نوم، نظافة، نشاط بدني، وهدوء ذهني.</span>
              </li>
            </ul>
          </motion.div>

          {/* Benefits & Caution */}
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
          >
             <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
               <HeartPulse className="text-primary" />
               أين تفيد ومتى يجب الحذر؟
             </h3>
             <p className="text-gray-600 text-sm mb-4 leading-relaxed">
               تُستخدم كثيراً لتحسين نمط الحياة، تقليل التوتر، آلام المفاصل، مشاكل الهضم، واضطرابات النوم.
             </p>
             
             <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3 items-start">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                <div className="text-xs text-yellow-800 leading-relaxed">
                   <strong>مهم جداً:</strong> بعض الأعشاب قد تتعارض مع أدوية أو تؤثر في الكبد والكلى. يُنصح دائماً باستشارة طبيب، ويفضل أن يكون على علم بالطب التكميلي، قبل تجربة أي علاج قوي.
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AyurvedaInfo;
