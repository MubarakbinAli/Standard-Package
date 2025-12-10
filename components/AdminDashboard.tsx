
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Save, Image as ImageIcon, Loader2, Upload, Link as LinkIcon, X, Copy, Check, Database, Plus, Trash2, Edit, ArrowLeft, Package, DollarSign, Eye, EyeOff, Sparkles, LayoutList, List } from 'lucide-react';
import { Resort } from '../lib/types';

// SQL command string to fix permission errors
const FIX_SQL_COMMANDS = `-- Copy and run this in Supabase SQL Editor:
insert into storage.buckets (id, name, public) values ('images', 'images', true) on conflict (id) do update set public = true;
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Insert" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'images' );
create policy "Authenticated Insert" on storage.objects for insert to authenticated with check ( bucket_id = 'images' );
create policy "Authenticated Update" on storage.objects for update to authenticated using ( bucket_id = 'images' );
create policy "Authenticated Delete" on storage.objects for delete to authenticated using ( bucket_id = 'images' );

create table if not exists site_content (key text primary key, value text);
alter table site_content enable row level security;
drop policy if exists "Public Read Content" on site_content;
create policy "Public Read Content" on site_content for select using (true);
drop policy if exists "Admin Write Content" on site_content;
create policy "Admin Write Content" on site_content for all to authenticated using (true) with check (true);`;

// Helper for Copy Button
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-primary hover:text-secondary flex items-center gap-1 text-xs font-bold transition-colors">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'تم النسخ' : 'نسخ الكود'}
    </button>
  );
};

// --- Professional Image Input Component ---
interface ImageInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  previewHeightClass?: string;
  onShowHelp?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({ label, value, onChange, previewHeightClass = "h-48", onShowHelp, onRemove, showRemove }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      if (data && data.publicUrl) onChange(data.publicUrl);
    } catch (error: any) {
      if (onShowHelp) onShowHelp();
      else alert(`فشل الرفع: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        {showRemove && onRemove && (
          <button onClick={onRemove} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md transition-colors">
            <Trash2 size={12} /> حذف
          </button>
        )}
      </div>
      
      <div className="group relative rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary/50 transition-all bg-gray-50 p-4">
        {value ? (
           <div className={`relative w-full ${previewHeightClass} rounded-xl overflow-hidden shadow-sm`}>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => onChange('')} 
                className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
              >
                <X size={14} />
              </button>
           </div>
        ) : (
           <div 
             className={`w-full ${previewHeightClass} flex flex-col items-center justify-center text-gray-400 gap-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-xl`}
             onClick={() => fileInputRef.current?.click()}
           >
              <div className="p-4 bg-white rounded-full shadow-sm">
                {isUploading ? <Loader2 className="animate-spin text-primary" size={24}/> : <Upload className="text-primary" size={24} />}
              </div>
              <span className="text-sm font-bold">{isUploading ? 'جاري الرفع...' : 'اضغط لرفع صورة'}</span>
           </div>
        )}
        
        {/* Hidden Input & URL Fallback */}
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
        
        <div className="mt-4 flex items-center gap-2">
           <div className="relative flex-1">
              <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                 type="text" 
                 value={value} 
                 onChange={(e) => onChange(e.target.value)} 
                 className="w-full pl-3 pr-9 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none dir-ltr font-mono text-xs bg-white" 
                 placeholder="أو ضع رابط الصورة هنا..." 
              />
           </div>
           <button 
             type="button" 
             onClick={() => fileInputRef.current?.click()}
             className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 whitespace-nowrap"
           >
             تصفح الجهاز
           </button>
        </div>
      </div>
    </div>
  );
};

// --- AI Text Parser Modal ---
interface AiParserModalProps {
  onClose: () => void;
  onSave: (features: {icon: string, title: string}[]) => void;
}
const AiParserModal: React.FC<AiParserModalProps> = ({ onClose, onSave }) => {
  const [text, setText] = useState('');
  
  const handleParse = () => {
    if(!text.trim()) return;
    // Simple logic: Split by new lines, remove bullets
    const lines = text.split('\n');
    const features = lines
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 0)
      .map(line => ({ icon: 'sparkles', title: line })); // Default icon
    
    onSave(features);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
             <Sparkles size={20}/> مساعد الذكاء الاصطناعي
           </h3>
           <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
        </div>
        <p className="text-sm text-gray-500 mb-3">الصق قائمة المميزات هنا (كل ميزة في سطر)، وسيقوم النظام بتنسيقها تلقائياً:</p>
        <textarea 
          className="w-full h-48 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm leading-relaxed"
          placeholder={"- إطلالة بحرية خلابة\n- واي فاي مجاني\n- مسبح خاص"}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">إلغاء</button>
          <button onClick={handleParse} className="px-6 py-2 text-sm font-bold bg-secondary text-white rounded-lg hover:bg-primary transition-colors">معالجة وإضافة</button>
        </div>
      </div>
    </div>
  );
};

// --- Resort Editor Component ---
interface ResortEditorProps {
  resort: Resort;
  onSave: (updatedResort: Resort) => void;
  onCancel: () => void;
  onShowHelp: () => void;
}

const ResortEditor: React.FC<ResortEditorProps> = ({ resort, onSave, onCancel, onShowHelp }) => {
  const [data, setData] = useState<Resort>(resort);
  const [currentTab, setCurrentTab] = useState<'info' | 'features' | 'packages'>('info');
  const [showAiModal, setShowAiModal] = useState(false);

  const handleChange = (field: keyof Resort, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // --- Feature Logic ---
  const removeFeature = (idx: number) => {
    const newFeatures = [...(data.features || [])];
    newFeatures.splice(idx, 1);
    handleChange('features', newFeatures);
  };
  
  const addAiFeatures = (newFeatures: {icon: string, title: string}[]) => {
    handleChange('features', [...(data.features || []), ...newFeatures]);
  };

  const addManualFeature = () => {
    const title = prompt("اكتب الميزة:");
    if(title) handleChange('features', [...(data.features || []), {icon: 'sparkles', title}]);
  };

  // --- Package Logic ---
  const handleCategoryChange = (catIndex: number, field: string, value: any) => {
    const newCats = [...data.packageCategories];
    (newCats[catIndex] as any)[field] = value;
    setData(prev => ({ ...prev, packageCategories: newCats }));
  };

  const handlePriceChange = (catIndex: number, tierIndex: number, field: 'priceSingle' | 'priceDouble', value: string) => {
    const newCats = [...data.packageCategories];
    newCats[catIndex].priceTiers[tierIndex][field] = value;
    setData(prev => ({ ...prev, packageCategories: newCats }));
  };

  const addPackageItem = (catIndex: number) => {
    const newCats = [...data.packageCategories];
    const name = prompt("اسم البرنامج (مثلاً: تخفيف الوزن):");
    if (name) {
      newCats[catIndex].items.push({ name, durations: ['7 ليالي', '14 ليلة'] }); 
      setData(prev => ({ ...prev, packageCategories: newCats }));
    }
  };

  const removePackageItem = (catIndex: number, itemIndex: number) => {
    const newCats = [...data.packageCategories];
    newCats[catIndex].items.splice(itemIndex, 1);
    setData(prev => ({ ...prev, packageCategories: newCats }));
  };
  
  const addCategory = () => {
     const newCat = {
        title: 'باقات جديدة',
        items: [],
        priceTiers: [
             { durationLabel: '7 ليالٍ', priceSingle: '', priceDouble: '' },
             { durationLabel: '14 ليلة', priceSingle: '', priceDouble: '' }
        ]
     };
     setData(prev => ({...prev, packageCategories: [...prev.packageCategories, newCat]}));
  };

  const removeCategory = (idx: number) => {
     if(confirm('هل أنت متأكد من حذف هذه المجموعة بالكامل؟')) {
        const newCats = [...data.packageCategories];
        newCats.splice(idx, 1);
        setData(prev => ({...prev, packageCategories: newCats}));
     }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center sticky top-0 z-30">
        <div>
          <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
            {data.id ? <Edit size={20}/> : <Plus size={20}/>} 
            {data.name || 'منتجع جديد'}
          </h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${data.isVisible !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {data.isVisible !== false ? 'منشور (ظاهر في الموقع)' : 'مسودة (مخفي)'}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-500 font-bold hover:bg-gray-50 text-sm">إلغاء</button>
          <button onClick={() => onSave(data)} className="px-6 py-2 rounded-lg bg-secondary text-white font-bold hover:bg-primary transition-colors flex items-center gap-2 text-sm shadow-lg shadow-secondary/20">
            <Check size={16} /> حفظ التعديلات
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-gray-50 border-l border-gray-100 p-4 space-y-2">
           <button onClick={() => setCurrentTab('info')} className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${currentTab === 'info' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
              <LayoutList size={18}/> المعلومات الأساسية
           </button>
           <button onClick={() => setCurrentTab('features')} className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${currentTab === 'features' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
              <Sparkles size={18}/> المميزات والمواصفات
           </button>
           <button onClick={() => setCurrentTab('packages')} className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${currentTab === 'packages' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
              <Package size={18}/> الباقات والأسعار
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto max-h-[80vh]">
           
           {/* TAB 1: BASIC INFO */}
           {currentTab === 'info' && (
             <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                   <label className="font-bold text-secondary">حالة الظهور في الموقع</label>
                   <button 
                     onClick={() => handleChange('isVisible', !(data.isVisible !== false))}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${data.isVisible !== false ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                   >
                      {data.isVisible !== false ? <><Eye size={18}/> ظاهر للزوار</> : <><EyeOff size={18}/> مخفي (مسودة)</>}
                   </button>
                </div>

                <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">اسم المنتجع</label>
                     <input type="text" value={data.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">الموقع (المدينة - المنطقة)</label>
                     <input type="text" value={data.location} onChange={e => handleChange('location', e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">الوصف المختصر (يظهر في الكرت)</label>
                     <textarea value={data.description} onChange={e => handleChange('description', e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-colors h-24" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">الوصف الكامل (داخل الصفحة)</label>
                     <textarea value={data.longDescription || ''} onChange={e => handleChange('longDescription', e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-colors h-32" />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <ImageInput label="صورة الغلاف الرئيسية" value={data.imageUrl} onChange={url => handleChange('imageUrl', url)} onShowHelp={onShowHelp} />
                </div>
             </div>
           )}

           {/* TAB 2: FEATURES */}
           {currentTab === 'features' && (
             <div>
                <div className="flex justify-between items-center mb-6">
                   <h4 className="font-bold text-lg text-secondary">مميزات المنتجع</h4>
                   <div className="flex gap-2">
                      <button onClick={() => setShowAiModal(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                         <Sparkles size={16}/> إضافة ذكية (AI)
                      </button>
                      <button onClick={addManualFeature} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                         <Plus size={16}/> إضافة يدوية
                      </button>
                   </div>
                </div>
                
                {(!data.features || data.features.length === 0) && (
                   <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400">
                      <Sparkles size={32} className="mx-auto mb-2 opacity-50"/>
                      <p>لا توجد مميزات مضافة بعد. استخدم "الإضافة الذكية" للصق قائمة جاهزة.</p>
                   </div>
                )}

                <div className="grid md:grid-cols-2 gap-3">
                   {data.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm group">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-primary">
                               <Sparkles size={14}/>
                            </div>
                            <span className="font-bold text-sm text-gray-700">{feat.title}</span>
                         </div>
                         <button onClick={() => removeFeature(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <X size={16}/>
                         </button>
                      </div>
                   ))}
                </div>
                
                {showAiModal && <AiParserModal onClose={() => setShowAiModal(false)} onSave={addAiFeatures} />}
             </div>
           )}

           {/* TAB 3: PACKAGES */}
           {currentTab === 'packages' && (
             <div className="space-y-8">
                <div className="flex justify-between items-end">
                   <div>
                      <h4 className="font-bold text-lg text-secondary">إدارة الباقات والأسعار</h4>
                      <p className="text-xs text-gray-500">قم بإنشاء مجموعات (مثل: باقات العافية) وأضف البرامج تحتها</p>
                   </div>
                   <button onClick={addCategory} className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold hover:bg-primary shadow-lg shadow-secondary/20">
                      <Plus size={16} className="inline ml-1"/> مجموعة جديدة
                   </button>
                </div>

                {data.packageCategories.map((cat, catIdx) => (
                  <div key={catIdx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                       <input 
                         type="text" 
                         value={cat.title} 
                         onChange={e => handleCategoryChange(catIdx, 'title', e.target.value)}
                         className="font-bold text-primary bg-transparent outline-none w-1/2 placeholder-gray-400"
                         placeholder="اسم المجموعة (مثلاً: باقات نمط الحياة)"
                       />
                       <button onClick={() => removeCategory(catIdx)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="حذف المجموعة">
                          <Trash2 size={16}/>
                       </button>
                    </div>

                    <div className="p-6 space-y-6">
                       {/* Programs List */}
                       <div>
                          <div className="flex justify-between items-center mb-3">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">البرامج المتاحة في هذه المجموعة</label>
                             <button onClick={() => addPackageItem(catIdx)} className="text-xs font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded transition-colors">
                                + إضافة برنامج
                             </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {cat.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="bg-white border border-gray-200 text-secondary px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                                   {item.name}
                                   <button onClick={() => removePackageItem(catIdx, itemIdx)} className="text-gray-400 hover:text-red-500 border-r border-gray-100 pr-2 mr-1">
                                      <X size={12}/>
                                   </button>
                                </div>
                             ))}
                             {cat.items.length === 0 && <span className="text-xs text-gray-400 italic">لا توجد برامج مضافة</span>}
                          </div>
                       </div>

                       {/* Pricing Table */}
                       <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">تسعير المجموعة (عملة ثابتة: ر.س)</label>
                          <div className="overflow-hidden rounded-xl border border-gray-200">
                             <table className="w-full text-sm text-right bg-white">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                   <tr>
                                      <th className="px-4 py-3">المدة</th>
                                      <th className="px-4 py-3">سعر السنجل (فرد)</th>
                                      <th className="px-4 py-3">سعر الدبل (زوجين)</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                   {cat.priceTiers.map((tier, tierIdx) => (
                                      <tr key={tierIdx} className="hover:bg-gray-50/50">
                                         <td className="px-4 py-3 font-bold text-secondary">{tier.durationLabel}</td>
                                         <td className="px-4 py-3">
                                            <div className="relative flex items-center">
                                               <input 
                                                  type="text" value={tier.priceSingle.replace(' ر.س', '')} 
                                                  onChange={e => handlePriceChange(catIdx, tierIdx, 'priceSingle', e.target.value + ' ر.س')}
                                                  className="w-full bg-gray-50 rounded-lg px-3 py-2 pl-10 border border-transparent focus:border-primary outline-none focus:bg-white transition-colors dir-ltr text-left font-mono"
                                                  placeholder="0"
                                               />
                                               <span className="absolute left-3 text-xs font-bold text-gray-400">SAR</span>
                                            </div>
                                         </td>
                                         <td className="px-4 py-3">
                                            <div className="relative flex items-center">
                                               <input 
                                                  type="text" value={tier.priceDouble.replace(' ر.س', '')} 
                                                  onChange={e => handlePriceChange(catIdx, tierIdx, 'priceDouble', e.target.value + ' ر.س')}
                                                  className="w-full bg-gray-50 rounded-lg px-3 py-2 pl-10 border border-transparent focus:border-primary outline-none focus:bg-white transition-colors dir-ltr text-left font-mono"
                                                  placeholder="0"
                                               />
                                               <span className="absolute left-3 text-xs font-bold text-gray-400">SAR</span>
                                            </div>
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
           )}

        </div>
      </div>
    </div>
  );
};


// --- Main Admin Component ---
interface AdminDashboardProps {
  onBack: () => void;
  currentHeroImages: string[];
  currentResorts: Resort[];
  onUpdateContent: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, currentHeroImages, currentResorts, onUpdateContent }) => {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'hero' | 'resorts'>('resorts');
  const [heroUrls, setHeroUrls] = useState<string[]>([]);
  const [resorts, setResorts] = useState<Resort[]>([]);
  
  // Resort Editor State
  const [editingResortId, setEditingResortId] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auth Init
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Data Init
  useEffect(() => {
    setHeroUrls(currentHeroImages.length > 0 ? currentHeroImages : ['']);
    setResorts(currentResorts);
  }, [currentHeroImages, currentResorts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  // --- Actions ---

  // 1. Hero Actions
  const addHeroSlot = () => setHeroUrls([...heroUrls, '']);
  const updateHero = (idx: number, val: string) => { const n = [...heroUrls]; n[idx] = val; setHeroUrls(n); };
  const removeHero = (idx: number) => { const n = [...heroUrls]; n.splice(idx, 1); setHeroUrls(n); };

  // 2. Resort Actions
  const handleEditResort = (id: string) => setEditingResortId(id);
  const handleCancelEdit = () => setEditingResortId(null);
  
  const handleUpdateResort = (updated: Resort) => {
    setResorts(prev => prev.map(r => r.id === updated.id ? updated : r));
    setEditingResortId(null);
  };

  const handleDeleteResort = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتجع؟')) {
      setResorts(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddResort = () => {
    const newResort: Resort = {
      id: Math.random().toString(36).substr(2, 9),
      isVisible: false, // Default to hidden
      name: 'منتجع جديد',
      location: 'كيرلا',
      description: 'وصف المنتجع...',
      imageUrl: '',
      features: [],
      packageCategories: [
        {
          title: 'باقات العافية',
          items: [{ name: 'تجديد النشاط', durations: ['7 ليالي', '14 ليلة'] }],
          priceTiers: [
             { durationLabel: '7 ليالٍ', priceSingle: '', priceDouble: '' },
             { durationLabel: '14 ليلة', priceSingle: '', priceDouble: '' }
          ]
        }
      ]
    };
    setResorts(prev => [...prev, newResort]);
    setEditingResortId(newResort.id);
  };

  // 3. Global Save
  const handleGlobalSave = async () => {
    setSaveStatus('saving');
    try {
      // Clean Hero Urls
      const validHero = heroUrls.filter(u => u.trim() !== '');
      
      const updates = [
        supabase.from('site_content').upsert({ key: 'hero_image', value: JSON.stringify(validHero) }),
        supabase.from('site_content').upsert({ key: 'resorts_data', value: JSON.stringify(resorts) }),
      ];

      const results = await Promise.all(updates);
      const err = results.find(r => r.error);
      if (err) throw err.error;

      setSaveStatus('saved');
      onUpdateContent();
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e: any) {
      console.error(e);
      setSaveStatus('error');
      setShowSqlHelp(true);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md space-y-4">
          <div className="text-center mb-6">
             <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={32}/></div>
             <h2 className="text-2xl font-bold text-secondary">لوحة التحكم</h2>
             <p className="text-gray-500 text-sm">تسجيل الدخول للمسؤولين</p>
          </div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded-xl" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded-xl" required />
          <button type="submit" className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-primary transition-colors">دخول</button>
          <button type="button" onClick={onBack} className="w-full text-gray-400 text-sm mt-2 hover:text-gray-600">العودة للموقع</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-right" dir="rtl">
      {/* SQL Helper Modal */}
      {showSqlHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-red-800 font-bold flex items-center gap-2"><Database/> إصلاح قاعدة البيانات</h3>
               <button onClick={() => setShowSqlHelp(false)}><X/></button>
             </div>
             <p className="mb-4 text-sm text-gray-600">انسخ الكود التالي وشغله في Supabase SQL Editor لتفعيل الحفظ والرفع:</p>
             <div className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs font-mono overflow-auto h-48 dir-ltr relative">
                <div className="absolute top-2 right-2"><CopyButton text={FIX_SQL_COMMANDS}/></div>
                {FIX_SQL_COMMANDS}
             </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-secondary">لوحة التحكم</h1>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('resorts')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'resorts' ? 'bg-white shadow text-secondary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                إدارة المنتجعات
              </button>
              <button 
                onClick={() => setActiveTab('hero')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'hero' ? 'bg-white shadow text-secondary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                صور الرئيسية
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowSqlHelp(true)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100" title="DB Fix"><Database size={20}/></button>
            <button onClick={onBack} className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200" title="Website"><ArrowLeft size={20}/></button>
            <button onClick={async () => { await supabase.auth.signOut(); onBack(); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Logout"><LogOut size={20}/></button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-secondary">صور العرض (Slideshow)</h2>
               <button onClick={addHeroSlot} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold shadow-lg shadow-secondary/20 hover:bg-primary transition-colors"><Plus size={16}/> إضافة صورة</button>
             </div>
             {heroUrls.map((url, i) => (
               <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 relative shadow-sm">
                  <div className="absolute top-4 left-4 font-bold text-gray-200 text-4xl select-none">{i+1}</div>
                  <ImageInput label={`صورة رقم ${i+1}`} value={url} onChange={u => updateHero(i, u)} onRemove={() => removeHero(i)} showRemove={heroUrls.length > 1} onShowHelp={() => setShowSqlHelp(true)} />
               </div>
             ))}
          </div>
        )}

        {/* RESORTS TAB */}
        {activeTab === 'resorts' && (
          <div>
            {editingResortId ? (
              <ResortEditor 
                resort={resorts.find(r => r.id === editingResortId)!} 
                onSave={handleUpdateResort}
                onCancel={handleCancelEdit}
                onShowHelp={() => setShowSqlHelp(true)}
              />
            ) : (
              <div className="space-y-6">
                 <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                       <h2 className="text-2xl font-bold text-secondary">قائمة المنتجعات</h2>
                       <p className="text-gray-500 text-sm">إدارة المحتوى، الباقات، والأسعار</p>
                    </div>
                    <button onClick={handleAddResort} className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/20 hover:bg-primary transition-all">
                       <Plus size={20}/> منتجع جديد
                    </button>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    {resorts.map(resort => (
                       <div key={resort.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
                          <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${resort.isVisible !== false ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                             {resort.isVisible !== false ? 'منشور' : 'مسودة (مخفي)'}
                          </div>
                          
                          <div className="h-48 bg-gray-100 relative">
                             {resort.imageUrl ? (
                               <img src={resort.imageUrl} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon/></div>
                             )}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button onClick={() => handleEditResort(resort.id)} className="bg-white text-secondary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                                   <Edit size={16}/> تعديل شامل
                                </button>
                             </div>
                          </div>
                          <div className="p-5">
                             <h3 className="font-bold text-lg text-secondary mb-1">{resort.name}</h3>
                             <p className="text-gray-500 text-sm mb-4 truncate">{resort.location}</p>
                             <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                                <div className="text-xs font-bold text-gray-400 flex items-center gap-1"><Package size={14}/> {resort.packageCategories.length} مجموعات باقات</div>
                                <button onClick={() => handleDeleteResort(resort.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Sticky Save Bar */}
      {!editingResortId && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
           <button 
             onClick={handleGlobalSave} 
             disabled={saveStatus === 'saving'}
             className={`flex items-center gap-3 px-10 py-3 rounded-xl font-bold text-lg shadow-lg transform hover:-translate-y-1 transition-all ${saveStatus === 'error' ? 'bg-red-500 text-white' : 'bg-secondary text-white hover:bg-primary'}`}
           >
             {saveStatus === 'saving' ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
             {saveStatus === 'saving' ? 'جاري الحفظ...' : saveStatus === 'saved' ? 'تم الحفظ بنجاح!' : saveStatus === 'error' ? 'خطأ في الحفظ' : 'حفظ كل التغييرات للموقع'}
           </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
