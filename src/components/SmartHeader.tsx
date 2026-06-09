import React, { useState, useEffect } from 'react';
import { Star, Clock, Zap, Search as SearchIcon } from 'lucide-react';
import type { View } from '../types';

interface SmartHeaderProps {
  onNavigate: (view: View) => void;
  currentView: View;
}

const SmartHeader: React.FC<SmartHeaderProps> = ({ onNavigate, currentView }) => {
  const [favorites, setFavorites] = useState<View[]>(() => {
    const saved = localStorage.getItem('humanius_favorites');
    return saved ? JSON.parse(saved) : ['personel', 'izin', 'bordro'];
  });

  const [recent, setRecent] = useState<View[]>(() => {
    const saved = localStorage.getItem('humanius_recent');
    return saved ? JSON.parse(saved) : ['personel'];
  });

  useEffect(() => {
    if (!recent.includes(currentView)) {
      const newRecent = [currentView, ...recent.filter(v => v !== currentView)].slice(0, 5);
      setRecent(newRecent);
      localStorage.setItem('humanius_recent', JSON.stringify(newRecent));
    } else {
      const newRecent = [currentView, ...recent.filter(v => v !== currentView)];
      setRecent(newRecent);
      localStorage.setItem('humanius_recent', JSON.stringify(newRecent));
    }
  }, [currentView]);

  const toggleFavorite = (view: View) => {
    setFavorites(prev => {
      const newFavs = prev.includes(view) ? prev.filter(v => v !== view) : [...prev, view];
      localStorage.setItem('humanius_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const getLabel = (view: View) => {
    const map: Record<string, string> = {
      'personel': 'Personel Listesi',
      'ozluk-dosyasi': 'Personel Kartı',
      'bordro': 'Bordro',
      'bordro-icmal': 'Bordro İcmal',
      'izin': 'İzin Talepleri',
      'izin-cakisma': 'İzin Çakışma',
      'pdks-devam': 'Devam Kontrolü',
      'egitim-girisi': 'Eğitim Girişi',
      'raporlar': 'Raporlar',
      'is-akisi': 'İş Akışı'
    };
    return map[view as string] || view;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
        {/* Son Kullanılanlar */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div className="flex gap-2">
            {recent.slice(0, 3).map((view, i) => (
              <button
                key={`recent-${view}-${i}`}
                onClick={() => onNavigate(view)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${currentView === view ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {getLabel(view)}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200"></div>

        {/* Favoriler (Sık Kullanılanlar) */}
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <div className="flex gap-2">
            {favorites.map((view, i) => (
              <div key={`fav-${view}-${i}`} className="group relative flex items-center">
                <button
                  onClick={() => onNavigate(view)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${currentView === view ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {getLabel(view)}
                </button>
                <button 
                  onClick={() => toggleFavorite(view)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:text-red-500 hover:border-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
            {!favorites.includes(currentView) && (
              <button 
                onClick={() => toggleFavorite(currentView)}
                className="text-xs px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
              >
                <Star className="w-3 h-3" /> Ekle
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate('arama')}
          className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl border border-gray-200 transition-colors"
        >
          <SearchIcon className="w-4 h-4" />
          <span>Hızlı Ara (Ctrl+K)</span>
        </button>
      </div>
    </div>
  );
};

export default SmartHeader;
