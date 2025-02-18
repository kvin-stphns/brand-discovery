'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="max-w-[2000px] mx-auto px-8 mt-[190px] mb-32">
      <h1 className="text-2xl tracking-[0.05em] font-bold mb-8">LOGIN</h1>
      <div className="max-w-md">
        {/* Login form will go here - keeping it minimal for now */}
        <form className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-black text-sm tracking-[0.15em]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-black text-sm tracking-[0.15em]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            className="w-full p-3 bg-black text-white text-sm tracking-[0.15em] hover:bg-black/90 transition-colors"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  )
} 