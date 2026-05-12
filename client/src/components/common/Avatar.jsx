import React from 'react'

// Avatar component: initials fallback, gradient by first letter
const gradients = {
  af: 'from-accent to-accent-hover',
  gl: 'from-teal-400 to-cyan-400',
  mr: 'from-pink-400 to-rose-400',
  sz: 'from-amber-400 to-orange-400',
}

const getGradientFor = (char) => {
  const c = (char || 'A').toLowerCase()
  if (c >= 'a' && c <= 'f') return gradients.af
  if (c >= 'g' && c <= 'l') return gradients.gl
  if (c >= 'm' && c <= 'r') return gradients.mr
  return gradients.sz
}

const Avatar = ({ src, name, size = 40, online }) => {
  if (src) {
    return (
      <div style={{ width: size, height: size }} className="relative">
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
        {online && <span className="absolute -right-0 -bottom-0 h-2.5 w-2.5 rounded-full bg-green border-2 border-base"></span>}
      </div>
    )
  }

  const initials = (name || 'U').split(' ').map(s => s[0]).slice(0,2).join('')
  const grad = getGradientFor(initials[0])

  return (
    <div style={{ width: size, height: size }} className={`relative rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-semibold`}> 
      <span>{initials}</span>
      {online && <span className="absolute -right-0 -bottom-0 h-2.5 w-2.5 rounded-full bg-green border-2 border-base"></span>}
    </div>
  )
}

export default Avatar
