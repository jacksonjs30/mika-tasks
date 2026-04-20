import React from 'react'

interface Props {
  name?: string
  src?: string | null
  size?: number
  className?: string
}

export function Avatar({ name, src, size = 32, className = '' }: Props) {
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const colors = [
    '#4f46e5', '#7c3aed', '#ec4899', '#f43f5e', 
    '#f97316', '#eab308', '#22c55e', '#06b6d4'
  ]
  const colorIndex = name ? name.length % colors.length : 0
  const bgColor = colors[colorIndex]

  const style = {
    width: size,
    height: size,
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    fontWeight: 600,
    color: 'white',
    backgroundColor: bgColor,
    overflow: 'hidden',
    flexShrink: 0,
    border: '2px solid var(--bg-surface)',
  }

  if (src) {
    return (
      <div style={style} className={className}>
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }

  return (
    <div style={style} className={className} title={name}>
      {initials}
    </div>
  )
}
