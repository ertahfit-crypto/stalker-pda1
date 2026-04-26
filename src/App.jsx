import { useState, useEffect } from 'react'
import './index.css';
import './App.css';

function App() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodes, setNodes] = useState([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [uptime, setUptime] = useState(0)
  const [userPosition, setUserPosition] = useState({ lat: null, lon: null })

  useEffect(() => {
    fetch('/data/cameras.json')
      .then(res => res.json())
      .then(data => setNodes(data))
      .catch(err => console.error('Failed to load nodes:', err))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setUptime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Геолокация пользователя
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('Ошибка геолокации:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      console.error('Геолокация не поддерживается')
    }
  }, [])

  // Авто-фокус на ближайших камерах
  useEffect(() => {
    if (!userPosition.lat || !userPosition.lon) return
    
    // Находим ближайшую камеру в радиусе 50 метров
    const nearestNode = nodes.find(node => shouldAutoFocus(node))
    
    if (nearestNode && selectedNode?.id !== nearestNode.id) {
      console.log('Авто-фокус на камере:', nearestNode.id)
      setSelectedNode(nearestNode)
    }
  }, [userPosition, nodes, selectedNode])

  // Функция расчета расстояния по формуле Гаверсинуса
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // радиус Земли в метрах
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // расстояние в метрах
  }

  // Получение расстояния до узла
  const getNodeDistance = (node) => {
    if (!userPosition.lat || !userPosition.lon) return Infinity
    
    const [nodeLat, nodeLon] = node.coords.split(',').map(coord => parseFloat(coord.trim()))
    return getDistance(userPosition.lat, userPosition.lon, nodeLat, nodeLon)
  }

  // Проверка доступности камеры на основе расстояния
  const isNodeInRange = (node) => {
    const distance = getNodeDistance(node)
    return distance <= 500 // Радиус 500 метров
  }

  // Проверка для авто-фокуса (менее 50 метров)
  const shouldAutoFocus = (node) => {
    const distance = getNodeDistance(node)
    return distance <= 50 // Радиус 50 метров для авто-фокуса
  }

  const handleNodeSelect = (node) => {
    if (!isNodeInRange(node)) return // Блокируем выбор дальних камер
    
    setIsConnecting(true)
    setTimeout(() => {
      setSelectedNode(node)
      setIsConnecting(false)
    }, 1500)
  }

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (date) => {
  try {
    return date.toLocaleTimeString('uk-UA', {
      timeZone: 'Europe/Kyiv',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    console.error("Ошибка таймзоны, использую локальное время");
    return date.toLocaleTimeString(); // Резервный вариант
  }
};

  return (
    <div className="crt-effect animate-flicker flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-black text-green-500 font-mono">
      {/* Крупный индикатор дистанции для мобильных */}
      <div className="md:hidden bg-black border-b border-green-500 p-4 text-center">
        <div className="text-2xl font-bold glow-text mb-2">
          {nodes.length > 0 ? 
            `${Math.round(getNodeDistance(nodes[0]))}m` : 
            'SCANNING...'
          }
        </div>
        <div className="text-xs">NEAREST NODE</div>
      </div>

      {/* Sidebar: на мобилках снизу и занимает 30% высоты, на десктопе слева 20% ширины */}
      <aside className="w-full h-1/3 md:w-1/5 md:h-full border-b md:border-b-0 md:border-r border-[#00ff9c] p-4 bg-black overflow-y-auto order-2 md:order-1">
        <h1 className="text-lg md:text-lg font-bold mb-4">[ACTIVE_NODES]</h1>
        <div className="text-xs md:text-xs space-y-2 mb-4">
          <div>UPTIME: {formatUptime(uptime)}</div>
          <div>TIME: {formatTime(currentTime)}</div>
          <div>CONNECTION: ENCRYPTED</div>
          <div className="hidden md:block">USER_POS: {userPosition.lat ? `${userPosition.lat.toFixed(4)}, ${userPosition.lon.toFixed(4)}` : 'SEARCHING...'}</div>
        </div>
          
          <div className="space-y-3 md:space-y-2">
            {nodes
              .map(node => ({ ...node, distance: getNodeDistance(node) }))
              .sort((a, b) => a.distance - b.distance)
              .map(node => {
                const inRange = isNodeInRange(node)
                const distance = node.distance
                
                return (
                  <div
                    key={node.id}
                    onClick={() => handleNodeSelect(node)}
                    className={`p-4 md:p-3 border ${
                      inRange ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${
                      selectedNode?.id === node.id 
                        ? 'border-green-500 bg-green-500 bg-opacity-10' 
                        : inRange 
                          ? 'border-green-900 hover:border-green-500'
                          : 'border-red-900'
                    }`}
                  >
                    <div className="text-sm md:text-sm">{node.id}</div>
                    <div className="text-xs md:text-xs mt-1">{node.name}</div>
                    <div className="hidden md:block text-xs mt-2">COORDS: {node.coords}</div>
                    <div className="text-sm md:text-xs mt-2 font-bold">
                      {distance === Infinity ? 'UNKNOWN' : `${Math.round(distance)}m`}
                    </div>
                    <div className={`text-xs md:text-xs mt-2 ${
                      inRange ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {inRange ? 'IN RANGE' : 'OUT OF RANGE'}
                    </div>
                  </div>
                )
              })}
          </div>
        </aside>

      {/* Main: на мобилках 70% высоты, на десктопе 80% ширины */}
      <main className="w-full h-2/3 md:w-4/5 md:h-full relative flex flex-col order-1 md:order-2">
        <div className="flex-1 p-2 md:p-4">
          <div className="h-full border border-green-500 relative bg-black">
            {isConnecting && (
              <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
                <div className="text-xl md:text-xl animate-pulse">CONNECTING...</div>
              </div>
            )}
            
            {selectedNode ? (
              <>
                <img 
                  src={selectedNode.url} 
                  alt={selectedNode.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="absolute top-2 md:top-4 left-2 md:left-4 text-xs space-y-1">
                  <div>NODE_ID: {selectedNode.id}</div>
                  <div className="hidden md:block">COORDS: {selectedNode.coords}</div>
                  <div>BITRATE: {Math.floor(Math.random() * 500 + 100)}KBPS</div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-xl md:text-2xl mb-4">NO SIGNAL</div>
                  <div className="text-xs md:text-sm">SELECT NODE TO BEGIN SURVEILLANCE</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}

export default App
