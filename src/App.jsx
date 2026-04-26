import React, { useState, useEffect } from 'react';
import './App.css';

// Обновленный список камер
const initialCameras = [
  {
    id: 'SHOP-01',
    name: 'LOCAL_STORE_NET',
    coords: { lat: 46.3910, lon: 30.7182 }, // Твои координаты из скрина
    url: 'https://media.giphy.com/media/oEI9uWUicKgZSMmH2f/giphy.gif' // Рабочий шум
  },
  {
    id: 'OD-048',
    name: 'ODESA_PORT_ENTRANCE',
    coords: { lat: 46.48, lon: 30.74 },
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3YmcHRwPW1mcmVjPTE/3o7TKMGpx6v4vV4V4s/giphy.gif'
  },
  {
    id: 'OD-001',
    name: 'CITY_CENTER_DOME',
    coords: { lat: 46.48, lon: 30.73 },
    url: 'https://media.giphy.com/media/3o7TKSj06W/giphy.gif'
  }
];

function App() {
  const [activeNode, setActiveNode] = useState(null);
  const [userPos, setUserPos] = useState({ lat: 0, lon: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      setUserPos({
        lat: pos.coords.latitude.toFixed(4),
        lon: pos.coords.longitude.toFixed(4)
      });
    }, (err) => console.error(err), { enableHighAccuracy: true });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Функция для выбора камеры с имитацией загрузки
  const handleSelectNode = (node) => {
    setLoading(true);
    setActiveNode(node);
    // Имитируем "взлом" сигнала 1 секунду
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="pda-container animate-flicker">
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ (Снизу на мобилках) */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#00ff9c] p-4 bg-black z-20 overflow-y-auto h-[40%] md:h-full">
        <div className="mb-4 text-[10px] leading-tight">
          <p className="glow-text text-sm mb-1">[СИСТЕМА_МОНИТОРИНГА]</p>
          <p>СТАТУС: ОНЛАЙН</p>
          <p>ВАШИ_КООРД: {userPos.lat}, {userPos.lon}</p>
          <hr className="border-[#00ff9c]/30 my-2" />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] opacity-50 mb-2">ДОСТУПНЫЕ УЗЛЫ ПОБЛИЗОСТИ:</p>
          {initialCameras.map(node => (
            <button
              key={node.id}
              onClick={() => handleSelectNode(node)}
              className={`w-full text-left p-2 border transition-all ${activeNode?.id === node.id ? 'bg-[#00ff9c] text-black' : 'border-[#00ff9c] text-[#00ff9c] hover:bg-[#00ff9c]/10'}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold">{node.id}</span>
                <span className="text-[9px] opacity-70">{node.name}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ЭКРАН (Сверху на мобилках) */}
      <main className="crt-effect h-[60%] md:h-full flex-1">
        {activeNode ? (
          <div className="relative w-full h-full bg-black">
            {/* Оверлей с данными о камере */}
            <div className="absolute top-2 left-2 z-30 text-[9px] bg-black/70 p-2 border border-[#00ff9c] font-mono">
              <p>УЗЕЛ: {activeNode.id}</p>
              <p>ЛОКАЦИЯ: {activeNode.name}</p>
              <p>КООРД: {activeNode.coords.lat}, {activeNode.coords.lon}</p>
              {loading && <p className="text-red-500 animate-pulse mt-1">DECRYPTING SIGNAL...</p>}
            </div>

            {!loading ? (
              <img src={activeNode.url} className="scanline w-full h-full object-cover" alt="Stream" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                 <div className="text-[#00ff9c] text-xs animate-pulse">CONNECTING...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-black">
            <div className="text-xl md:text-3xl glow-text mb-2">НЕТ СИГНАЛА</div>
            <p className="text-[10px] animate-pulse">ВЫБЕРИТЕ УЗЕЛ ДЛЯ ПОДКЛЮЧЕНИЯ</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;