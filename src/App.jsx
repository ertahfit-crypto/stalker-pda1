import React, { useState, useEffect } from 'react';
import './App.css';

// БАЗА ДАННЫХ КАМЕР
const cameraDB = [
  { id: 'SHOP-01', name: 'МАГАЗИН_У_ДОМА', lat: 46.3910, lon: 30.7182, url: 'https://media.giphy.com/media/oEI9uWUicKgZSMmH2f/giphy.gif', type: 'image' },
  { id: 'OD-PORT', name: 'МОРВОКЗАЛ_ВХОД', lat: 46.4895, lon: 30.7451, url: 'https://images.webcams.travel/preview/1569429158.jpg', type: 'image' },
  { id: 'ISS-LIVE', name: 'ОРБИТА_МКС', lat: 0, lon: 0, url: 'https://www.youtube-nocookie.com/embed/jPTD2gnZFUw?autoplay=1&mute=1', type: 'video' }
];

function App() {
  const [userPos, setUserPos] = useState({ lat: 0, lon: 0 });
  const [sortedCams, setSortedCams] = useState([]);
  const [activeNode, setActiveNode] = useState(null);

  // Функция расчета дистанции (в метрах)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setUserPos({ lat: lat.toFixed(4), lon: lon.toFixed(4) });

      // Сортируем камеры: те, что ближе 500м — в приоритете
      const sorted = [...cameraDB].sort((a, b) => {
        const distA = getDistance(lat, lon, a.lat, a.lon);
        const distB = getDistance(lat, lon, b.lat, b.lon);
        return distA - distB;
      });
      setSortedCams(sorted);
    }, null, { enableHighAccuracy: true });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="pda-container animate-flicker">
      <aside className="w-full md:w-80 border-r border-[#00ff9c] p-4 bg-black overflow-y-auto h-[40%] md:h-full">
        <div className="text-[10px] mb-4">
          <p className="glow-text text-xs uppercase">[СКАНИРОВАНИЕ_МЕСТНОСТИ]</p>
          <p>ВАШ_GPS: {userPos.lat || 'ПОИСК...'}, {userPos.lon || 'ПОИСК...'}</p>
        </div>

        <div className="space-y-2">
          {sortedCams.map(cam => {
            const dist = userPos.lat !== 0 ? (getDistance(userPos.lat, userPos.lon, cam.lat, cam.lon) / 1000).toFixed(1) : '?';
            return (
              <button
                key={cam.id}
                onClick={() => setActiveNode(cam)}
                className={`w-full text-left p-2 border ${activeNode?.id === cam.id ? 'bg-[#00ff9c] text-black' : 'border-[#00ff9c] text-[#00ff9c]'}`}
              >
                <div className="flex justify-between text-[10px]">
                  <span className="font-bold">{cam.id}</span>
                  <span>{dist} KM</span>
                </div>
                <div className="text-[8px] opacity-70">{cam.name}</div>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 bg-black relative h-[60%] md:h-full">
        {activeNode ? (
          <div className="w-full h-full">
            <div className="absolute top-2 left-2 z-30 text-[9px] bg-black/80 p-2 border border-[#00ff9c]">
              <p>УЗЕЛ: {activeNode.id}</p>
              <p>ДИСТАНЦИЯ: {(getDistance(userPos.lat, userPos.lon, activeNode.lat, activeNode.lon)/1000).toFixed(2)} KM</p>
            </div>
            {activeNode.type === 'video' ? (
              <iframe
                src={activeNode.url}
                className="w-full h-full border-0 grayscale"
                allow="autoplay; encrypted-media"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <img src={activeNode.url} className="scanline w-full h-full object-cover" alt="cam" />
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[#00ff9c] animate-pulse">ОЖИДАНИЕ СИГНАЛА...</div>
        )}
      </main>
    </div>
  );
}

export default App;