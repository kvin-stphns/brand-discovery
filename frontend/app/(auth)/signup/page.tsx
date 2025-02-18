'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Github, Twitter, Mail, Facebook } from 'lucide-react'
import Image from 'next/image'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <div className="max-w-[2000px] mx-auto px-8 mt-[190px] mb-32">
      <h1 className="text-2xl tracking-[0.05em] font-bold mb-8">SIGN UP</h1>
      <div className="max-w-md">
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
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border border-black text-sm tracking-[0.15em]"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button 
            className="w-full p-3 bg-black text-white text-sm tracking-[0.15em] hover:bg-black/90 transition-colors"
          >
            SIGN UP
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
            href="/login" 
            className="text-sm tracking-[0.15em] text-black/60 hover:text-black transition-colors"
          >
            ALREADY HAVE AN ACCOUNT? LOGIN
          </Link>
        </div>

        {/* Wallet Connect Placeholder */}
        <div className="mt-8 pt-8 border-t border-black/10">
          <button 
            className="w-full p-3 border border-black text-sm tracking-[0.15em] hover:bg-black/5 transition-colors"
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            CONNECT WALLET
          </button>
        </div>
      </div>
    </div>
  )
} 