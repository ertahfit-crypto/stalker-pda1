import React, { useState, useEffect } from 'react';
import './App.css';

// 1. БАЗА ДАННЫХ КАМЕР (С твоей хижиной и магазом)
const cameraDB = [
  {
    id: 'SHOP-01',
    name: 'МАГАЗИН_У_ДОМА',
    lat: 46.3910, lon: 30.7182,
    url: 'https://bclivecan1.standardgraduates.com/mjpg/video.mjpg',
    type: 'image'
  },
  {
    id: 'FOREST-01',
    name: 'ЛЕСНАЯ ХИЖИНА',
    lat: 46.4000, lon: 30.7000,
    url: 'https://www.youtube-nocookie.com/embed/04Pq3l95bRA?autoplay=1&mute=1',
    type: 'video'
  },
  {
    id: 'пес',
    name: 'стрим пес ',
    lat: 46.5000, lon: 30.8000,
    url: 'https://www.youtube.com/embed/NKvlt-K0jn0',
    type: 'image'
  }
];

function App() {
  const [activeNode, setActiveNode] = useState(null);
  const [userPos, setUserPos] = useState({ lat: 0, lon: 0 });

  // Вспомогательная функция для расчета дистанции
  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1) return 0;
    const R = 6371; // км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      setUserPos({
        lat: pos.coords.latitude.toFixed(4),
        lon: pos.coords.longitude.toFixed(4)
      });
    }, (err) => console.error("GPS Error:", err), { enableHighAccuracy: true });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="pda-container animate-flicker">
      {/* САЙДБАР СО СПИСКОМ */}
      <aside className="w-full md:w-80 border-r border-[#00ff9c] p-4 bg-black overflow-y-auto h-[40%] md:h-full z-20">
        <div className="text-[10px] mb-4 uppercase">
          <p className="glow-text text-sm mb-1">[СИСТЕМА_МОНИТОРИНГА]</p>
          <p>ВАШ_GPS: {userPos.lat}, {userPos.lon}</p>
          <hr className="border-[#00ff9c]/30 my-2" />
        </div>

        <div className="space-y-2">
          {cameraDB.map(node => (
            <button
              key={node.id}
              onClick={() => setActiveNode(node)}
              className={`w-full text-left p-2 border transition-all ${activeNode?.id === node.id ? 'bg-[#00ff9c] text-black shadow-[0_0_10px_#00ff9c]' : 'border-[#00ff9c] text-[#00ff9c] hover:bg-[#00ff9c]/10'}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold">{node.id}</span>
                <span className="text-[9px]">{(getDistance(userPos.lat, userPos.lon, node.lat, node.lon)).toFixed(1)} KM</span>
              </div>
              <div className="text-[9px] opacity-70 uppercase">{node.name}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* ГЛАВНЫЙ ЭКРАН */}
      <main className="flex-1 bg-black relative h-[60%] md:h-full overflow-hidden">
        {activeNode ? (
          <div className="w-full h-full flex items-center justify-center">
            {/* Оверлей данных */}
            <div className="absolute top-4 left-4 z-40 text-[10px] bg-black/80 p-2 border border-[#00ff9c] font-mono pointer-events-none">
              <p className="text-[#00ff9c] animate-pulse">● СИГНАЛ: {activeNode.id}</p>
              <p>ДИСТАНЦИЯ: {(getDistance(userPos.lat, userPos.lon, activeNode.lat, activeNode.lon)).toFixed(2)} KM</p>
            </div>

            {/* САМ ПЛЕЕР */}
            {activeNode.type === 'video' ? (
              <iframe
                key={activeNode.id}
                src={activeNode.url}
                className="w-full h-full border-0 grayscale contrast-125"
                allow="autoplay; encrypted-media"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <img
                key={activeNode.id}
                src={activeNode.url}
                className="scanline w-full h-full object-cover"
                alt="camera-stream"
                onError={(e) => { e.target.src = 'https://media.giphy.com/media/oEI9uWUicKgZSMmH2f/giphy.gif'; }}
              />
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#00ff9c]">
            <div className="text-2xl glow-text mb-2 tracking-widest uppercase">Поиск частот...</div>
            <div className="text-[10px] opacity-50 font-mono animate-pulse">SCANNING ENCRYPTED NETWORKS...</div>
          </div>
        )}
      </main>
    </div>
  );
}

// КРИТИЧЕСКИ ВАЖНО: ЭКСПОРТ ДЛЯ CLOUDFLARE
export default App;