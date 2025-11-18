import React, { useEffect, useRef, useState } from 'react'

export default function ChatPanel({ event, user, onClose, backendUrl }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (!event) return
    const fetchMsgs = async () => {
      const res = await fetch(`${backendUrl}/events/${event.id}/messages`)
      const data = await res.json()
      setMessages(data)
      setTimeout(() => listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    fetchMsgs()
    const id = setInterval(fetchMsgs, 2500)
    return () => clearInterval(id)
  }, [event, backendUrl])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await fetch(`${backendUrl}/events/${event.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, text })
    })
    setText('')
  }

  if (!event) return null
  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Chat</div>
          <div className="font-semibold text-slate-900 text-sm">{event.activity}</div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`max-w-[90%] rounded-lg p-2 text-sm ${m.user===user?'bg-blue-600 text-white ml-auto':'bg-slate-100 text-slate-900 mr-auto'}`}>
            <div className="text-[10px] opacity-70">{m.user}</div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="p-3 border-t flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Send</button>
      </form>
    </div>
  )
}
