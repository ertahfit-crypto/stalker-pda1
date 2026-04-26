import React, { useState, useEffect } from 'react';
import './App.css';

// Пример данных камер (потом подгрузишь из JSON)
const initialCameras = [
  { id: 'OD-048', name: 'ODESA_PORT', coords: { lat: 46.48, lon: 30.74 }, url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3Y1M3YmcHRwPW1mcmVjPTE/3o7TKMGpx6v4vV4V4s/giphy.gif' },
  { id: 'OD-001', name: 'DERIBAS_ST', coords: { lat: 46.48, lon: 30.73 }, url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHNwdjV6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z/3o7TKSj06W/giphy.gif' }
];

function App() {
  const [activeNode, setActiveNode] = useState(null);
  const [userPos, setUserPos] = useState({ lat: 0, lon: 0 });

  useEffect(() => {
    navigator.geolocation.watchPosition((pos) => {
      setUserPos({ lat: pos.coords.latitude.toFixed(4), lon: pos.coords.longitude.toFixed(4) });
    });
  }, []);

  return (
    <div className="pda-container animate-flicker">
      {/* ЛЕВАЯ ПАНЕЛЬ / НИЖНЯЯ ПАНЕЛЬ */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#00ff9c] p-4 bg-black z-20 overflow-y-auto h-2/5 md:h-full">
        <div className="mb-4 text-xs">
          <p className="glow-text">[ACTIVE_NODES]</p>
          <p>USER_POS: {userPos.lat}, {userPos.lon}</p>
        </div>

        <div className="space-y-2">
          {initialCameras.map(node => (
            <div
              key={node.id}
              onClick={() => setActiveNode(node)}
              className={`p-2 border cursor-pointer transition-colors ${activeNode?.id === node.id ? 'bg-[#00ff9c] text-black' : 'border-[#00ff9c] hover:bg-[#00ff9c]/20'}`}
            >
              <p className="text-sm font-bold">{node.id}</p>
              <p className="text-[10px]">{node.name}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ГЛАВНЫЙ ЭКРАН МОНИТОРА */}
      <main className="crt-effect h-3/5 md:h-full">
        {activeNode ? (
          <div className="relative w-full h-full">
            <div className="absolute top-4 left-4 z-30 text-[10px] bg-black/50 p-2 border border-[#00ff9c]">
              <p>NODE_ID: {activeNode.id}</p>
              <p>COORDS: {activeNode.coords.lat}, {activeNode.coords.lon}</p>
              <p className="text-[#00ff9c] animate-pulse">CONNECTING...</p>
            </div>
            <img src={activeNode.url} className="scanline" alt="Camera stream" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="text-2xl md:text-4xl glow-text">NO SIGNAL</div>
            <p className="text-xs animate-pulse">SELECT NODE TO BEGIN SURVEILLANCE</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
