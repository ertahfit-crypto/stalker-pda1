// 1. ОБНОВЛЕННЫЙ СПИСОК (С рабочими потоками)
const cameraDB = [
  {
    id: 'SHOP-01',
    name: 'МАГАЗИН_У_ДОМА',
    lat: 46.3910, lon: 30.7182,
    // Ссылка на реальный MJPEG поток (пример открытой камеры)
    url: 'https://bclivecan1.standardgraduates.com/mjpg/video.mjpg',
    type: 'image'
  },
  {
    id: 'ISS-LIVE',
    name: 'лисная хижина ',
    lat: 0, lon: 0,
    // Правильный эмбед для YouTube
    url: 'https://www.youtube-nocookie.com/embed/04Pq3l95bRA?autoplay=1&mute=1',
    type: 'video'
  },
  {
    id: 'TEST-STATIC',
    name: 'ШУМ_ЭФИРА',
    lat: 46.4000, lon: 30.7000,
    url: 'https://media.giphy.com/media/oEI9uWUicKgZSMmH2f/giphy.gif',
    type: 'image'
  }
];

// 2. ИСПРАВЛЕННЫЙ ВЫВОД В <main>
<main className="flex-1 bg-black relative h-[60%] md:h-full overflow-hidden">
  {activeNode ? (
    <div className="w-full h-full flex items-center justify-center">

      {/* Данные о подключении */}
      <div className="absolute top-4 left-4 z-40 text-[10px] bg-black/80 p-2 border border-[#00ff9c] font-mono pointer-events-none">
        <p className="text-[#00ff9c] animate-pulse">● СИГНАЛ: {activeNode.id}</p>
        <p>ДИСТАНЦИЯ: {(getDistance(userPos.lat, userPos.lon, activeNode.lat, activeNode.lon)/1000).toFixed(2)} KM</p>
      </div>

      {/* САМ ПЛЕЕР С ДОБАВЛЕННЫМ KEY */}
      {activeNode.type === 'video' ? (
        <iframe
          key={activeNode.id} // ВОТ ОН! Добавь эту строку
          src={activeNode.url}
          className="w-full h-full border-0 grayscale contrast-125"
          allow="autoplay; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <img
          key={activeNode.id} // И СЮДА ТОЖЕ
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