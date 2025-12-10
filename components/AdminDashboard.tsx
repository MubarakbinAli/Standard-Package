
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, LogOut, Save, Image as ImageIcon, Loader2, AlertCircle, Upload, Link as LinkIcon, X, Copy, Check, Database, Plus, Trash2, Edit, List, ArrowLeft, Package, DollarSign, Eye, EyeOff, Sparkles, Wand2 } from 'lucide-react';
import { Resort, ResortFeature } from '../lib/types';

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
      <div className="flex justify-between items-end">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        {showRemove && onRemove && (
          <button onClick={onRemove} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
            <Trash2 size={12} /> حذف
          </button>
        )}
      </div>
      
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 transition-colors hover:border-primary/50 bg-gray-50/50">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Preview Area */}
          <div className={`w-full md:w-40 ${previewHeightClass} rounded-xl overflow-hidden bg-white border border-gray-200 relative group shrink-0 shadow-sm flex items-center justify-center`}>
            {value ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-300 flex flex-col items-center">
                <ImageIcon size={32} />
              </div>
            )}
            {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"><Loader2 className="animate-spin text-primary" size={24} /></div>}
          </div>

          {/* Controls */}
          <div className="flex-1 w-full space-y-3">
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
             
             <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm">
               {isUploading ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18} />} 
               {isUploading ? 'جاري الرفع...' : 'اختر صورة من جهازك'}
             </button>
             
             <div className="flex items-center gap-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-medium">أو عبر رابط</span>
                <div className="h-px bg-gray-200 flex-1"></div>
             </div>

             <div className="relative">
                <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none dir-ltr font-mono text-xs bg-white text-gray-600" placeholder="https://..." />
                <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             </div>
          </div>
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
  const [aiText, setAiText] = useState('');

  const handleChange = (field: keyof Resort, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // --- Package Logic ---
  const handleCategoryChange = (catIndex: number, field: string, value: any) => {
    const newCats = [...data.packageCategories];
    (newCats[catIndex] as any)[field] = value;
    setData(prev => ({ ...prev, packageCategories: newCats }));
  };

  const handlePriceChange = (catIndex: number, tierIndex: number, field: 'priceSingle' | 'priceDouble', value: string) => {
    const newCats = [...data.packageCategories];
    // Strip old currency symbols if user pasted them
    const cleanValue = value.replace('ر.س', '').replace('SAR', '').trim();
    // Add currency symbol format visually (stored as string for flexibility, but we will enforce symbol in UI)
    newCats[catIndex].priceTiers[tierIndex][field] = cleanValue;
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

  // --- Features Logic ---
  const handleSmartFeaturesParse = () => {
    if (!aiText.trim()) return;
    
    // Keyword to icon mapper
    const keywordIcons: {[key: string]: string} = {
       'wifi': 'wifi', 'نت': 'wifi', 'انترنت': 'wifi',
       'مسبح': 'waves', 'pool': 'waves', 'سباحة': 'waves',
       'طعام': 'utensils', 'food': 'utensils', 'مطعم': 'utensils',
       'يوغا': 'activity', 'yoga': 'activity',
       'طبيب': 'stethoscope', 'doctor': 'stethoscope',
       'طبيعة': 'leaf', 'nature': 'leaf', 'حديقة': 'flower-2',
       'بحر': 'sunset', 'ocean': 'sunset', 'شاطئ': 'sunset',
       'مطار': 'plane', 'airport': 'plane',
       'نقل': 'plane', 'توصيل': 'plane',
       'غرفة': 'bed', 'room': 'bed', 'إقامة': 'bed'
    };

    const lines = aiText.split(/\n/);
    const newFeatures: ResortFeature[] = lines.filter(line => line.trim().length > 0).map(line => {
       const lowerLine = line.toLowerCase();
       let icon = 'sparkles'; // Default
       
       for (const [key, val] of Object.entries(keywordIcons)) {
          if (lowerLine.includes(key)) {
             icon = val;
             break;
          }
       }
       return { title: line.trim(), icon };
    });

    setData(prev => ({
       ...prev,
       features: [...(prev.features || []), ...newFeatures]
    }));
    setAiText('');
  };

  const removeFeature = (index: number) => {
     const newFeatures = [...(data.features || [])];
     newFeatures.splice(index, 1);
     setData(prev => ({ ...prev, features: newFeatures }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-secondary p-6 text-white flex justify-between items-center sticky top-0 z-10">
        <div>
           <h3 className="text-xl font-bold">{data.name || 'منتجع جديد'}</h3>
           <p className="text-white/60 text-xs mt-1">تعديل البيانات، المميزات، والأسعار</p>
        </div>
        <div className="flex items-center gap-3">
           {/* Visibility Toggle */}
           <button 
             onClick={() => handleChange('isVisible', !data.isVisible)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${data.isVisible !== false ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}
           >
              {data.isVisible !== false ? <><Eye size={14}/> منشور بالموقع</> : <><EyeOff size={14}/> مخفي</>}
           </button>
           <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold">إلغاء</button>
           <button onClick={() => onSave(data)} className="bg-primary hover:bg-white hover:text-primary text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Check size={16}/> حفظ التغييرات
           </button>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Section 1: Basic Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">البيانات الأساسية</h4>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">اسم المنتجع</label>
               <input type="text" value={data.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">الموقع (المدينة)</label>
               <input type="text" value={data.location} onChange={e => handleChange('location', e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">الوصف المختصر (للبطاقة)</label>
               <textarea value={data.description} onChange={e => handleChange('description', e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary outline-none h-24 bg-gray-50 focus:bg-white transition-colors resize-none" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">الوسائط</h4>
            <ImageInput label="صورة الغلاف الرئيسية" value={data.imageUrl} onChange={url => handleChange('imageUrl', url)} onShowHelp={onShowHelp} />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 2: Features & Specs (With AI) */}
        <div>
           <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-primary" size={20}/>
              <h4 className="text-lg font-bold text-secondary">المميزات والمواصفات</h4>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              {/* Feature List */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-500">المميزات الحالية ({data.features?.length || 0})</span>
                 </div>
                 <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {data.features?.map((feat, idx) => (
                       <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                          <div className="flex items-center gap-3">
                             <div className="text-primary bg-primary/10 p-1.5 rounded-lg"><Sparkles size={12}/></div>
                             <span className="text-sm font-medium text-gray-700">{feat.title}</span>
                          </div>
                          <button onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                       </div>
                    ))}
                    {(!data.features || data.features.length === 0) && <p className="text-center text-gray-400 text-xs py-4">لا توجد مميزات مضافة بعد</p>}
                 </div>
              </div>

              {/* AI Parser */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                 <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="text-indigo-600" size={18} />
                    <span className="text-sm font-bold text-indigo-900">مساعد الذكاء الاصطناعي</span>
                 </div>
                 <p className="text-xs text-indigo-700/70 mb-3">الصق قائمة المميزات هنا (كل ميزة في سطر)، وسأقوم بتنسيقها واختيار الأيقونات تلقائياً.</p>
                 <textarea 
                   value={aiText}
                   onChange={e => setAiText(e.target.value)}
                   className="w-full h-32 rounded-xl border border-indigo-200 focus:border-indigo-400 outline-none p-3 text-sm bg-white/50 mb-3"
                   placeholder={`واي فاي مجاني\nمسبح خارجي\nمطعم فاخر...`}
                 />
                 <button onClick={handleSmartFeaturesParse} disabled={!aiText.trim()} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                    إضافة المميزات ذكياً
                 </button>
              </div>
           </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 3: Packages & Prices */}
        <div>
          <div className="flex items-center gap-2 mb-6">
              <DollarSign className="text-primary" size={20}/>
              <h4 className="text-lg font-bold text-secondary">إدارة الباقات والأسعار</h4>
           </div>
          
          <div className="space-y-8">
             {data.packageCategories.map((cat, catIdx) => (
               <div key={catIdx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                   <div className="flex items-center gap-2 w-1/2">
                      <span className="text-xs font-bold text-gray-400">اسم الفئة (مثلاً: باقات العافية):</span>
                      <input 
                        type="text" 
                        value={cat.title} 
                        onChange={e => handleCategoryChange(catIdx, 'title', e.target.value)}
                        className="font-bold text-secondary bg-transparent border-b border-dashed border-gray-300 focus:border-primary outline-none flex-1"
                      />
                   </div>
                 </div>

                 <div className="p-6 grid lg:grid-cols-2 gap-8">
                    {/* Left: Programs List */}
                    <div>
                       <label className="text-xs font-bold text-gray-400 block mb-3 uppercase tracking-wider">البرامج المتاحة</label>
                       <div className="space-y-2">
                          {cat.items.map((item, itemIdx) => (
                             <div key={itemIdx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                                <button onClick={() => removePackageItem(catIdx, itemIdx)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                             </div>
                          ))}
                          <button onClick={() => addPackageItem(catIdx)} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
                             <Plus size={14}/> إضافة برنامج جديد
                          </button>
                       </div>
                    </div>

                    {/* Right: Pricing Table */}
                    <div>
                       <label className="text-xs font-bold text-gray-400 block mb-3 uppercase tracking-wider">قائمة الأسعار (ريال سعودي)</label>
                       <div className="bg-orange-50/50 rounded-xl border border-orange-100 overflow-hidden">
                          <table className="w-full text-sm text-right">
                             <thead>
                                <tr className="bg-orange-100/50 text-orange-900 border-b border-orange-100">
                                   <th className="py-2 px-3 font-bold text-xs">المدة</th>
                                   <th className="py-2 px-3 font-bold text-xs">سنجل (1 شخص)</th>
                                   <th className="py-2 px-3 font-bold text-xs">دبل (2 شخص)</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-orange-100/50">
                                {cat.priceTiers.map((tier, tierIdx) => (
                                   <tr key={tierIdx}>
                                      <td className="py-2 px-3 font-bold text-gray-700">{tier.durationLabel}</td>
                                      <td className="py-2 px-3">
                                         <div className="flex items-center bg-white border border-orange-200 rounded-lg px-2 focus-within:border-orange-400 focus-within:ring-2 ring-orange-100">
                                            <input 
                                              type="text" value={tier.priceSingle.replace('ر.س', '').trim()} 
                                              onChange={e => handlePriceChange(catIdx, tierIdx, 'priceSingle', e.target.value)}
                                              className="w-full py-1.5 outline-none text-left font-mono text-sm bg-transparent"
                                              placeholder="0"
                                            />
                                            <span className="text-xs font-bold text-gray-400 mr-2 select-none">ر.س</span>
                                         </div>
                                      </td>
                                      <td className="py-2 px-3">
                                         <div className="flex items-center bg-white border border-orange-200 rounded-lg px-2 focus-within:border-orange-400 focus-within:ring-2 ring-orange-100">
                                            <input 
                                              type="text" value={tier.priceDouble.replace('ر.س', '').trim()} 
                                              onChange={e => handlePriceChange(catIdx, tierIdx, 'priceDouble', e.target.value)}
                                              className="w-full py-1.5 outline-none text-left font-mono text-sm bg-transparent"
                                              placeholder="0"
                                            />
                                            <span className="text-xs font-bold text-gray-400 mr-2 select-none">ر.س</span>
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
      name: 'منتجع جديد',
      location: 'كيرلا',
      description: 'وصف المنتجع...',
      imageUrl: '',
      isVisible: true,
      features: [],
      packageCategories: [
        {
          title: 'باقات العافية',
          items: [{ name: 'تجديد النشاط', durations: ['7 ليالي', '14 ليلة'] }],
          priceTiers: [
             { durationLabel: '7 ليالٍ', priceSingle: '0', priceDouble: '0' },
             { durationLabel: '14 ليلة', priceSingle: '0', priceDouble: '0' }
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-center text-secondary mb-4">تسجيل الدخول للوحة التحكم</h2>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded-xl" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded-xl" required />
          <button type="submit" className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-primary transition-colors">دخول</button>
          <button type="button" onClick={onBack} className="w-full text-gray-400 text-sm mt-2">العودة للموقع</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
               <button onClick={addHeroSlot} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold"><Plus size={16}/> إضافة صورة</button>
             </div>
             {heroUrls.map((url, i) => (
               <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 relative shadow-sm">
                  <div className="absolute top-4 left-4 font-bold text-gray-200 text-4xl">{i+1}</div>
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
                       <div key={resort.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                          {/* Visibility Badge */}
                          {resort.isVisible === false && (
                             <div className="absolute top-4 left-4 z-10 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <EyeOff size={12} /> مخفي
                             </div>
                          )}
                          
                          <div className="h-48 bg-gray-100 relative">
                             {resort.imageUrl ? (
                               <img src={resort.imageUrl} className={`w-full h-full object-cover transition-all ${resort.isVisible === false ? 'grayscale opacity-70' : ''}`} />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon/></div>
                             )}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button onClick={() => handleEditResort(resort.id)} className="bg-white text-secondary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-colors">
                                   <Edit size={16}/> تعديل شامل
                                </button>
                             </div>
                          </div>
                          <div className="p-5">
                             <h3 className="font-bold text-lg text-secondary mb-1">{resort.name}</h3>
                             <p className="text-gray-500 text-sm mb-4 truncate">{resort.location}</p>
                             <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                                <div className="text-xs font-bold text-gray-400 flex items-center gap-1"><Package size={14}/> {resort.packageCategories.length} فئات باقات</div>
                                <button onClick={() => handleDeleteResort(resort.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-center z-40">
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
