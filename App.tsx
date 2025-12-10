
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Intro from './components/Intro';
import AyurvedaPage from './components/AyurvedaPage';
import ResortCard from './components/ResortCard';
import ResortModal from './components/ResortModal';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { RESORTS_DATA } from './constants';
import { Resort } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

function App() {
  const [selectedResort, setSelectedResort] = useState<Resort | null>(null);
  const [view, setView] = useState<'home' | 'ayurveda' | 'admin'>('home');
  
  // Dynamic Content State
  // Now manages an array of strings for slideshow
  const [heroImages, setHeroImages] = useState<string[]>([
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/402854972.jpg?k=f1b953d922904c06282924151212879685a36329067b439c0879e273a7c66914&o=&hp=1"
  ]);
  const [dynamicResorts, setDynamicResorts] = useState<Resort[]>(RESORTS_DATA);

  // Check URL for admin mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin' || window.location.hash === '#admin') {
      setView('admin');
    }
  }, []);

  // Fetch dynamic content from Supabase
  const fetchContent = async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from('site_content').select('*');
      
      if (data && !error) {
        // Map content to state
        const contentMap = data.reduce((acc: any, item: any) => {
          acc[item.key] = item.value;
          return acc;
        }, {});

        // Update Hero: Attempt to parse JSON array, fallback to single string
        if (contentMap['hero_image']) {
          try {
             const parsed = JSON.parse(contentMap['hero_image']);
             if (Array.isArray(parsed)) {
                setHeroImages(parsed);
             } else {
                setHeroImages([contentMap['hero_image']]);
             }
          } catch (e) {
             // Not valid JSON, assume it is a single URL string (legacy support)
             setHeroImages([contentMap['hero_image']]);
          }
        }

        // Update Resorts
        const updatedResorts = RESORTS_DATA.map(resort => {
          const key = `resort_${resort.id}_image`;
          if (contentMap[key]) {
            return { ...resort, imageUrl: contentMap[key] };
          }
          return resort;
        });
        setDynamicResorts(updatedResorts);
      }
    } catch (err) {
      console.error("Error fetching content:", err);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Admin View
  if (view === 'admin') {
    return (
      <AdminDashboard 
        onBack={() => setView('home')} 
        currentHeroImages={heroImages} // Pass array
        resorts={dynamicResorts}
        onUpdateContent={fetchContent}
      />
    );
  }

  // Ayurveda View
  if (view === 'ayurveda') {
    return (
      <>
        <AyurvedaPage onBack={() => setView('home')} />
        <Footer onAdminClick={() => setView('admin')} />
      </>
    );
  }

  // Home View
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Hero backgroundImages={heroImages} />
      
      <main className="flex-grow">
        {/* Pass the navigation handler to Intro */}
        <Intro onLearnMore={() => setView('ayurveda')} />
        
        {/* Resorts Grid */}
        <section className="px-4 py-10 max-w-7xl mx-auto">
           <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-secondary mb-4">منتجعاتنا المختارة</h2>
              <p className="text-gray-500">اختر وجهتك المثالية للرفاهية</p>
           </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12">
            {dynamicResorts.map((resort) => (
              <ResortCard 
                key={resort.id} 
                resort={resort} 
                onClick={setSelectedResort} 
              />
            ))}
          </div>
        </section>
      </main>

      <Footer onAdminClick={() => setView('admin')} />

      <ResortModal 
        resort={selectedResort} 
        onClose={() => setSelectedResort(null)} 
      />
    </div>
  );
}

export default App;
