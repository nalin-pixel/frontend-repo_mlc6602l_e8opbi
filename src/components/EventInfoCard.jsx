import React from 'react'

export default function EventInfoCard({ event, onClose, onJoin }) {
  if (!event) return null
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl w-[90%] max-w-md p-4 border border-slate-200">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-slate-900 font-semibold text-lg">{event.activity}</h3>
          <p className="text-slate-600 text-sm">Hosted by {event.host_name}</p>
          <p className="text-slate-700 text-sm mt-1">{event.attendees} going</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onJoin && onJoin(event)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Join</button>
        <button onClick={onClose} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">Close</button>
      </div>
    </div>
  )
}
