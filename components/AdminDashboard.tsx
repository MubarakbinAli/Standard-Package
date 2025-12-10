
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, LogOut, Save, Image as ImageIcon, Loader2, AlertCircle, Upload, Link as LinkIcon, X, Copy, Check, Database, Plus, Trash2 } from 'lucide-react';
import { Resort } from '../types';

// SQL command string to fix permission errors
const FIX_SQL_COMMANDS = `-- Copy and run this in Supabase SQL Editor:

-- PART 1: STORAGE PERMISSIONS (For uploading images)
-------------------------------------------------------
-- 1. Create 'images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- 2. Drop existing storage policies to prevent conflicts
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Authenticated Insert" on storage.objects;
drop policy if exists "Authenticated Update" on storage.objects;
drop policy if exists "Authenticated Delete" on storage.objects;

-- 3. Storage Policy: Allow Public View
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- 4. Storage Policy: Allow Authenticated Upload/Update/Delete
create policy "Authenticated Insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'images' );

create policy "Authenticated Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'images' );

create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'images' );

-- PART 2: DATABASE TABLE PERMISSIONS (For saving settings)
-------------------------------------------------------
-- 5. Create table 'site_content' if it doesn't exist
create table if not exists site_content (
  key text primary key,
  value text
);

-- 6. Enable RLS on the table
alter table site_content enable row level security;

-- 7. Table Policy: Allow Public Read (So the website can see the images)
drop policy if exists "Public Read Content" on site_content;
create policy "Public Read Content" on site_content for select using (true);

-- 8. Table Policy: Allow Admin Write (So you can save changes)
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

// --- Sub-component for Image Input (URL + Upload) ---
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
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setIsUploading(true);

    try {
      // 1. Create a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase Storage (Bucket: 'images')
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // 3. Get Public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // 4. Update Parent State
      if (data && data.publicUrl) {
        onChange(data.publicUrl);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      const errorMessage = (error.message || JSON.stringify(error)).toLowerCase();

      // Check for specific RLS or Bucket errors using broad matching
      if (
        errorMessage.includes('row-level security') || 
        errorMessage.includes('security policy') ||
        errorMessage.includes('violate') ||
        errorMessage.includes('bucket not found') ||
        error.statusCode === '403' ||
        error.statusCode === 403
      ) {
        if (onShowHelp) onShowHelp();
      } else {
        alert(`فشل الرفع: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-sm font-bold text-gray-600">{label}</label>
        {showRemove && onRemove && (
          <button 
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg"
          >
            <Trash2 size={12} /> حذف الصورة
          </button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Preview Area */}
        <div className={`w-full md:w-1/3 ${previewHeightClass} rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group shrink-0 shadow-inner`}>
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">
                 معاينة
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ImageIcon size={32} />
              <span className="text-xs">لا توجد صورة</span>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 w-full space-y-4">
           {/* Option 1: Upload */}
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">خيار 1: رفع من الجهاز</div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20} />}
                {isUploading ? 'جاري الرفع...' : 'اضغط لرفع صورة'}
              </button>
           </div>

           <div className="flex items-center gap-3 text-gray-300">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs font-bold">أو</span>
              <div className="h-px bg-gray-200 flex-1"></div>
           </div>

           {/* Option 2: URL */}
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">خيار 2: رابط مباشر</div>
             <div className="relative">
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none dir-ltr font-mono text-sm bg-white"
                  placeholder="https://example.com/image.jpg"
                />
                <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---
interface AdminDashboardProps {
  onBack: () => void;
  currentHeroImages: string[]; // Accept Array now
  resorts: Resort[];
  onUpdateContent: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, currentHeroImages, resorts, onUpdateContent }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  
  // Edit States
  const [heroUrls, setHeroUrls] = useState<string[]>([]);
  const [resortImages, setResortImages] = useState<{ [key: string]: string }>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveErrorDetails, setSaveErrorDetails] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize data
  useEffect(() => {
    const initialImages: { [key: string]: string } = {};
    resorts.forEach(r => {
      initialImages[r.id] = r.imageUrl;
    });
    setResortImages(initialImages);
    
    // Ensure heroUrls is always an array
    if (Array.isArray(currentHeroImages) && currentHeroImages.length > 0) {
      setHeroUrls(currentHeroImages);
    } else {
      setHeroUrls(['']); // Default empty slot
    }
  }, [resorts, currentHeroImages]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onBack();
  };

  // Hero Array Handlers
  const addHeroImageSlot = () => {
    setHeroUrls([...heroUrls, '']);
  };

  const removeHeroImageSlot = (index: number) => {
    const newUrls = [...heroUrls];
    newUrls.splice(index, 1);
    setHeroUrls(newUrls);
  };

  const updateHeroUrl = (index: number, val: string) => {
    const newUrls = [...heroUrls];
    newUrls[index] = val;
    setHeroUrls(newUrls);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveErrorDetails('');
    
    try {
      // Filter out empty URLs and serialize array to JSON string
      const validHeroUrls = heroUrls.filter(u => u.trim() !== '');
      const heroValue = JSON.stringify(validHeroUrls.length > 0 ? validHeroUrls : heroUrls);

      const updates = [
        // Update Hero (Save as JSON string)
        supabase.from('site_content').upsert({ key: 'hero_image', value: heroValue }),
        
        // Update Resorts
        ...Object.entries(resortImages).map(([id, url]) => 
          supabase.from('site_content').upsert({ key: `resort_${id}_image`, value: url })
        )
      ];

      const results = await Promise.all(updates);
      
      const firstError = results.find(r => r.error);
      if (firstError) {
        const errorMsg = firstError.error?.message || JSON.stringify(firstError.error);
        setSaveErrorDetails(errorMsg);
        setShowSqlHelp(true);
        setSaveStatus('error');
        return;
      }

      setSaveStatus('saved');
      onUpdateContent(); 
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      console.error(err);
      setSaveErrorDetails(err.message || 'Unknown error occurred');
      setSaveStatus('error');
      setShowSqlHelp(true);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6 text-secondary">
            <div className="p-4 bg-gray-100 rounded-full">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-secondary mb-6">لوحة تحكم الإدارة</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">البريد الإلكتروني</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-primary transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
            </button>
          </form>
          
          <button onClick={onBack} className="w-full mt-4 text-gray-400 text-sm hover:text-gray-600">
            العودة للموقع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* RLS Error Helper Modal */}
      {showSqlHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-red-100 flex flex-col max-h-[90vh]">
              <div className="bg-red-50 p-4 flex items-center justify-between border-b border-red-100 shrink-0">
                 <h3 className="text-red-800 font-bold flex items-center gap-2">
                    <Database size={20} />
                    إصلاح إعدادات قاعدة البيانات
                 </h3>
                 <button onClick={() => setShowSqlHelp(false)} className="text-red-400 hover:text-red-700">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                 {saveErrorDetails && (
                   <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-mono dir-ltr border border-red-200 break-all">
                     <strong>System Error:</strong> {saveErrorDetails}
                   </div>
                 )}

                 <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    لكي يتم حفظ الصور وعرضها في الموقع، يجب تهيئة قاعدة البيانات في Supabase. <br/>
                    انسخ الكود التالي وشغله في <strong>SQL Editor</strong>:
                 </p>
                 <div className="bg-[#1e1e1e] rounded-lg p-4 relative group border border-gray-700 text-left mb-6" dir="ltr">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <CopyButton text={FIX_SQL_COMMANDS} />
                    </div>
                    <pre className="text-xs text-[#d4d4d4] font-mono overflow-x-auto whitespace-pre-wrap h-64 custom-scrollbar leading-relaxed">
                       {FIX_SQL_COMMANDS}
                    </pre>
                 </div>
                 
                 <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 border border-blue-100 leading-relaxed">
                    <strong>لماذا يظهر هذا؟</strong> <br/>
                    بشكل افتراضي، Supabase تمنع الكتابة والقراءة لأسباب أمنية. هذا الكود ينشئ الجداول المطلوبة ويسمح للموقع بعرض الصور (قراءة عامة) ويسمح لك كأدمن بتعديلها.
                 </div>

                 <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => setShowSqlHelp(false)}
                      className="px-6 py-2 bg-secondary text-white rounded-xl font-bold hover:bg-primary transition-colors"
                    >
                      إغلاق
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-xl font-bold text-secondary flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            لوحة التحكم
          </h1>
          <div className="flex gap-2 md:gap-4">
             <button 
                onClick={() => setShowSqlHelp(true)} 
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
             >
                <Database size={16} />
                إعدادات قاعدة البيانات
             </button>

             <button onClick={onBack} className="text-gray-500 hover:text-secondary font-medium text-sm md:text-base">
                الموقع
             </button>
             <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium text-sm md:text-base">
                <LogOut size={18} />
                <span className="hidden md:inline">خروج</span>
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        
        {/* Mobile Database Button */}
        <button 
           onClick={() => setShowSqlHelp(true)} 
           className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors border border-red-100"
        >
           <Database size={16} />
           إصلاح إعدادات قاعدة البيانات
        </button>

        {/* Hero Section Edit - Multiple Images */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
               <ImageIcon className="text-primary" />
               صور الهيرو (السلايد شو)
             </h2>
             <button 
               onClick={addHeroImageSlot}
               className="flex items-center gap-2 px-4 py-2 bg-[#FAFAF5] text-secondary rounded-lg text-sm font-bold hover:bg-primary/10 transition-colors"
             >
               <Plus size={16} /> إضافة صورة
             </button>
          </div>
          
          <div className="space-y-8">
            {heroUrls.map((url, index) => (
              <div key={index} className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="absolute -top-3 -right-3 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10">
                   {index + 1}
                </div>
                <ImageInput 
                  label={`الصورة رقم ${index + 1}`}
                  value={url}
                  onChange={(newUrl) => updateHeroUrl(index, newUrl)}
                  previewHeightClass="h-48"
                  onShowHelp={() => setShowSqlHelp(true)}
                  showRemove={heroUrls.length > 1}
                  onRemove={() => removeHeroImageSlot(index)}
                />
              </div>
            ))}
            
            {heroUrls.length === 0 && (
               <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  لا توجد صور حالياً. اضغط "إضافة صورة" للبدء.
               </div>
            )}
          </div>
        </section>

        {/* Resorts Edit */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <ImageIcon className="text-primary" />
            صور المنتجعات
          </h2>
          
          <div className="space-y-12">
            {resorts.map((resort) => (
              <div key={resort.id} className="pb-12 border-b border-gray-100 last:border-0 last:pb-0">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-secondary">
                   <div className="w-2 h-6 bg-primary rounded-full"></div>
                   {resort.name}
                </h3>
                <ImageInput 
                  label="صورة المنتجع"
                  value={resortImages[resort.id] || ''}
                  onChange={(newUrl) => setResortImages(prev => ({ ...prev, [resort.id]: newUrl }))}
                  previewHeightClass="h-48"
                  onShowHelp={() => setShowSqlHelp(true)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Save Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
           <button 
             onClick={handleSave}
             disabled={saveStatus === 'saving'}
             className={`
               flex items-center gap-3 px-8 py-3 rounded-xl text-white font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1
               ${saveStatus === 'saved' ? 'bg-green-600' : saveStatus === 'error' ? 'bg-red-500' : 'bg-secondary hover:bg-primary'}
             `}
           >
             {saveStatus === 'saving' && <Loader2 className="animate-spin" />}
             {saveStatus === 'saved' && <span className="flex items-center gap-2">تم الحفظ بنجاح</span>}
             {saveStatus === 'error' && <span className="flex items-center gap-2">حدث خطأ (اضغط للإصلاح)</span>}
             {saveStatus === 'idle' && <><Save size={20} /> حفظ التغييرات</>}
           </button>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
