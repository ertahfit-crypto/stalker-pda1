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

  // Функция расчета расстояния между двумя точками (формула Хаверсина)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000 // Радиус Земли в метрах
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Проверка доступности камеры на основе расстояния
  const isNodeInRange = (node) => {
    if (!userPosition.lat || !userPosition.lon) return true // Если нет геолокации, все доступны
    
    const [nodeLat, nodeLon] = node.coords.split(',').map(coord => parseFloat(coord.trim()))
    const distance = calculateDistance(userPosition.lat, userPosition.lon, nodeLat, nodeLon)
    return distance <= 300 // Радиус 300 метров
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
    <div className="crt-effect animate-flicker h-screen bg-black text-green-500 font-mono">
      <div className="flex h-screen">
        {/* Sidebar - 20% */}
        <div className="w-1/5 border-r border-green-500 p-4">
          <h1 className="text-lg font-bold mb-4">[ACTIVE_NODES]</h1>
          <div className="text-xs space-y-2 mb-4">
            <div>UPTIME: {formatUptime(uptime)}</div>
            <div>TIME: {formatTime(currentTime)}</div>
            <div>CONNECTION: ENCRYPTED</div>
            <div>USER_POS: {userPosition.lat ? `${userPosition.lat.toFixed(4)}, ${userPosition.lon.toFixed(4)}` : 'SEARCHING...'}</div>
          </div>
          
          <div className="space-y-2">
            {nodes.map(node => {
              const inRange = isNodeInRange(node)
              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeSelect(node)}
                  className={`p-3 border ${
                    inRange ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  } ${
                    selectedNode?.id === node.id 
                      ? 'border-green-500 bg-green-500 bg-opacity-10' 
                      : inRange 
                        ? 'border-green-900 hover:border-green-500'
                        : 'border-red-900'
                  }`}
                >
                  <div className="text-sm">{node.id}</div>
                  <div className="text-xs mt-1">{node.name}</div>
                  <div className="text-xs mt-2">COORDS: {node.coords}</div>
                  <div className={`text-xs mt-2 ${
                    inRange ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {inRange ? 'IN RANGE' : 'SIGNAL LOST'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Monitor - 80% */}
        <div className="flex-1 p-4">
          <div className="h-full border border-green-500 relative bg-black">
            {isConnecting && (
              <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
                <div className="text-xl animate-pulse">CONNECTING...</div>
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
                <div className="absolute top-4 left-4 text-xs space-y-1">
                  <div>NODE_ID: {selectedNode.id}</div>
                  <div>COORDS: {selectedNode.coords}</div>
                  <div>BITRATE: {Math.floor(Math.random() * 500 + 100)}KBPS</div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl mb-4">NO SIGNAL</div>
                  <div className="text-sm">SELECT NODE TO BEGIN SURVEILLANCE</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
