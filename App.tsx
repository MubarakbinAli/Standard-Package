
import React, { useState } from 'react';
import Hero from './components/Hero';
import Intro from './components/Intro';
import AyurvedaPage from './components/AyurvedaPage';
import ResortCard from './components/ResortCard';
import ResortModal from './components/ResortModal';
import Footer from './components/Footer';
import { RESORTS_DATA } from './constants';
import { Resort } from './types';

function App() {
  const [selectedResort, setSelectedResort] = useState<Resort | null>(null);
  const [view, setView] = useState<'home' | 'ayurveda'>('home');

  // If in Ayurveda View, show the full page
  if (view === 'ayurveda') {
    return (
      <>
        <AyurvedaPage onBack={() => setView('home')} />
        <Footer />
      </>
    );
  }

  // Home View
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Hero />
      
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
            {RESORTS_DATA.map((resort) => (
              <ResortCard 
                key={resort.id} 
                resort={resort} 
                onClick={setSelectedResort} 
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <ResortModal 
        resort={selectedResort} 
        onClose={() => setSelectedResort(null)} 
      />
    </div>
  );
}

export default App;
