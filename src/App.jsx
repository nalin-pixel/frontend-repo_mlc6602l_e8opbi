import React, { useEffect, useMemo, useState } from 'react'
import MapView from './components/MapView'
import EventInfoCard from './components/EventInfoCard'
import ChatPanel from './components/ChatPanel'
import './index.css'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App() {
  const [userPos, setUserPos] = useState(null)
  const [events, setEvents] = useState([])
  const [active, setActive] = useState(null)
  const [chatEvent, setChatEvent] = useState(null)
  const [username, setUsername] = useState('Guest'+Math.floor(Math.random()*1000))

  // Get geolocation
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    }, () => {
      // fallback: somewhere central
      setUserPos({ lat: 40.7128, lng: -74.0060 })
    })
  }, [])

  // Fetch nearby events when we have location
  useEffect(() => {
    const fetchEvents = async () => {
      if (!userPos) return
      const params = new URLSearchParams({ lat: userPos.lat, lng: userPos.lng, radius_km: 25 })
      const res = await fetch(`${backendUrl}/events?${params.toString()}`)
      const data = await res.json()
      setEvents(data)
    }
    fetchEvents()
  }, [userPos])

  const onJoin = async (ev) => {
    // join
    await fetch(`${backendUrl}/events/${ev.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username })
    })
    setActive(null)
    setChatEvent(ev)
  }

  // Seed a few demo events near user once when position is known and no events found
  useEffect(() => {
    const seed = async () => {
      if (!userPos) return
      // fetch again; if empty, seed 3 demo events
      const params = new URLSearchParams({ lat: userPos.lat, lng: userPos.lng, radius_km: 25 })
      const res = await fetch(`${backendUrl}/events?${params.toString()}`)
      const data = await res.json()
      if (data.length === 0) {
        const demo = [
          { host_name: 'Alex', activity: 'Pickup Soccer', lat: userPos.lat + 0.01, lng: userPos.lng + 0.01, attendees: 3 },
          { host_name: 'Maya', activity: 'Coffee & Co-work', lat: userPos.lat - 0.008, lng: userPos.lng + 0.006, attendees: 5 },
          { host_name: 'Sam', activity: 'Evening Run', lat: userPos.lat + 0.004, lng: userPos.lng - 0.012, attendees: 2 },
        ]
        for (const ev of demo) {
          await fetch(`${backendUrl}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ev) })
        }
        // refetch
        const res2 = await fetch(`${backendUrl}/events?${params.toString()}`)
        const data2 = await res2.json()
        setEvents(data2)
      }
    }
    seed()
  }, [userPos])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="p-4 flex items-center justify-between">
        <h1 className="font-semibold">Nearby Events</h1>
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <span>Signed in as</span>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white" />
        </div>
      </header>
      <div className="p-4 pt-0 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 h-[calc(100vh-64px)]">
        <div className="relative">
          <MapView userPosition={userPos} events={events} onMarkerClick={setActive} />
          <EventInfoCard event={active} onClose={()=>setActive(null)} onJoin={onJoin} />
        </div>
        {chatEvent && (
          <ChatPanel backendUrl={backendUrl} event={chatEvent} user={username} onClose={()=>setChatEvent(null)} />
        )}
      </div>
    </div>
  )
}
