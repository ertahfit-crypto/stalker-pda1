import React, { useState, useEffect } from 'react';
import './App.css';

// СПИСОК РЕАЛЬНЫХ ОТКРЫТЫХ КАМЕР (Без паролей)
const initialCameras = [
  {
    id: 'ORBIT-01',
    name: 'ISS_LIVE_FEED',
    coords: { lat: 0, lon: 0 },
    // Правильная ссылка для встраивания стрима с МКС
    url: 'https://www.youtube-nocookie.com/embed/jPTD2gnZFUw?autoplay=1&mute=1',
    type: 'video'
  },
  {
    id: 'CITY-LIVE',
    name: 'ODESA_DUMSKAYA',
    coords: { lat: 46.48, lon: 30.74 },
    // Пример другой камеры (если найдешь рабочую ссылку для встраивания)
    url: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UC...&autoplay=1',
    type: 'video'
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

  const handleSelectNode = (node) => {
    setLoading(true);
    setActiveNode(node);
    // Имитация дешифровки сигнала
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="pda-container animate-flicker">
      {/* ПАНЕЛЬ СПИСКА (Нижняя часть на мобилках) */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#00ff9c] p-4 bg-black z-20 overflow-y-auto h-[40%] md:h-full">
        <div className="mb-4 text-[10px] uppercase">
          <p className="glow-text text-sm mb-1">[СИСТЕМА_ВЗЛОМА_УЗЛОВ]</p>
          <p>ВАШИ_КООРД: {userPos.lat}, {userPos.lon}</p>
          <hr className="border-[#00ff9c]/30 my-2" />
        </div>

        <div className="space-y-2">
          {initialCameras.map(node => (
            <button
              key={node.id}
              onClick={() => handleSelectNode(node)}
              className={`w-full text-left p-3 border transition-all ${activeNode?.id === node.id ? 'bg-[#00ff9c] text-black shadow-[0_0_10px_#00ff9c]' : 'border-[#00ff9c] text-[#00ff9c] hover:bg-[#00ff9c]/10'}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono">{node.id}</span>
                <span className="text-[8px] opacity-60 italic">DETECTED</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ЭКРАН ВИЗУАЛИЗАЦИИ (Верхняя часть) */}
      <main className="crt-effect h-[60%] md:h-full flex-1 relative bg-[#050505]">
        {activeNode ? (
          <div className="w-full h-full">
            <div className="absolute top-4 left-4 z-30 text-[9px] bg-black/80 p-2 border border-[#00ff9c] font-mono pointer-events-none">
              <p>ID: {activeNode.id}</p>
              <p>COORD: {activeNode.coords.lat} / {activeNode.coords.lon}</p>
              {loading ? <p className="text-red-500 animate-pulse mt-1">HACKING...</p> : <p className="text-blue-400 mt-1">STABLE CONNECTION</p>}
            </div>

            {!loading ? (
              activeNode.type === 'video' ? (
                <iframe src={activeNode.url} className="w-full h-full border-0 grayscale contrast-125" allow="autoplay" />
              ) : (
                <img src={activeNode.url} className="scanline w-full h-full object-cover opacity-80" alt="cam" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                 <div className="text-[#00ff9c] text-xs animate-pulse font-mono">SEARCHING FOR SIGNAL...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#00ff9c]/50">
            <div className="text-xl glow-text animate-pulse">СКАНЕР_АКТИВЕН</div>
            <p className="text-[9px] mt-2">ВЫБЕРИТЕ ДОСТУПНУЮ ЧАСТОТУ В СПИСКЕ</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;