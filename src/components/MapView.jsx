import React, { useEffect, useMemo, useRef, useState } from 'react'

// Simple Leaflet-less map using Google Maps JS API is not available here.
// We'll use MapLibre GL JS (open-source) via CDN in index.html and a plain div here.

const MAPBOX_STYLE = 'https://demotiles.maplibre.org/style.json'

export default function MapView({ events, onMarkerClick, userPosition }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return
    // Ensure maplibregl is available globally (added via script in index.html)
    if (!window.maplibregl || mapInstance.current) return
    const map = new window.maplibregl.Map({
      container: mapRef.current,
      style: MAPBOX_STYLE,
      center: userPosition ? [userPosition.lng, userPosition.lat] : [0, 0],
      zoom: userPosition ? 12 : 2,
    })
    map.addControl(new window.maplibregl.NavigationControl(), 'top-right')
    mapInstance.current = map
    return () => map.remove()
  }, [userPosition])

  // Add user marker
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !userPosition) return

    // Create marker element
    const el = document.createElement('div')
    el.className = 'w-3 h-3 bg-blue-600 rounded-full ring-4 ring-blue-300 shadow-lg'

    const marker = new window.maplibregl.Marker({ element: el })
      .setLngLat([userPosition.lng, userPosition.lat])
      .addTo(map)

    return () => marker.remove()
  }, [userPosition])

  // Add event markers
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    const markers = (events || []).map((ev) => {
      const el = document.createElement('div')
      el.className = 'w-4 h-4 bg-rose-600 rounded-full ring-4 ring-rose-300 cursor-pointer shadow-lg'
      el.addEventListener('click', () => onMarkerClick && onMarkerClick(ev))
      return new window.maplibregl.Marker({ element: el })
        .setLngLat([ev.lng, ev.lat])
        .addTo(map)
    })

    return () => markers.forEach(m => m.remove())
  }, [events, onMarkerClick])

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
  )
}
