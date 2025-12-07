import React, { useState } from 'react';
import Hero from './components/Hero';
import Intro from './components/Intro';
import ResortCard from './components/ResortCard';
import ResortModal from './components/ResortModal';
import Footer from './components/Footer';
import { RESORTS_DATA } from './constants';
import { Resort } from './types';

function App() {
  const [selectedResort, setSelectedResort] = useState<Resort | null>(null);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Hero />
      
      <main className="flex-grow">
        <Intro />
        
        <section className="px-4 py-10 max-w-7xl mx-auto">
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
