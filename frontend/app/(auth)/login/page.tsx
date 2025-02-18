'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Github, Twitter, Mail, Facebook } from 'lucide-react'
import Image from 'next/image'

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
        
        {/* Social Login */}
        <div className="mt-6 flex justify-center space-x-6">
          <button className="p-2 hover:opacity-60 transition-opacity">
            <Image src="/google.svg" alt="Google" width={20} height={20} />
          </button>
          <button className="p-2 hover:opacity-60 transition-opacity">
            <Twitter className="w-5 h-5" />
          </button>
          <button className="p-2 hover:opacity-60 transition-opacity">
            <Facebook className="w-5 h-5" />
          </button>
          <button className="p-2 hover:opacity-60 transition-opacity">
            <Github className="w-5 h-5" />
          </button>
          <button className="p-2 hover:opacity-60 transition-opacity">
            <Image src="/apple.svg" alt="Apple" width={20} height={20} />
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <Link 
            href="/signup" 
            className="text-sm tracking-[0.15em] text-black/60 hover:text-black transition-colors"
          >
            DON'T HAVE AN ACCOUNT? SIGN UP
          </Link>
        </div>

        {/* Wallet Connect Placeholder */}
        <div className="mt-8 pt-8 border-t border-black/10">
          <button 
            className="w-full p-3 border border-black text-sm tracking-[0.15em] hover:bg-black/5 transition-colors"
            onClick={(e) => {
              e.preventDefault()
              // Wallet connect logic will go here
            }}
          >
            CONNECT WALLET
          </button>
        </div>
      </div>
    </div>
  )
} 