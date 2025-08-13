"use client"

import React from 'react'

type Props = { children: React.ReactNode }

type State = { hasError: boolean; error?: Error }

export default class DevErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('DevErrorBoundary caught error:', error, errorInfo)
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError && process.env.NODE_ENV !== 'production') {
      return (
        <div className="p-4 m-4 border border-red-600 bg-red-50 text-red-800">
          <p className="font-bold mb-2">A client error occurred.</p>
          <pre className="whitespace-pre-wrap text-xs">{String(this.state.error?.stack || this.state.error?.message)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}