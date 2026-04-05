

interface AvatarProps {
  config?: {
    base?: string
    hat?: string | null
    glasses?: string | null
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Avatar({ config, size = 'md' }: AvatarProps) {
  const fontSize = size === 'sm' ? '1rem' : size === 'md' ? '2rem' : size === 'lg' ? '4rem' : '6rem'
  const hatSize = size === 'sm' ? '0.8rem' : size === 'md' ? '1.5rem' : size === 'lg' ? '3rem' : '4rem'
  const glassesSize = size === 'sm' ? '0.6rem' : size === 'md' ? '1.2rem' : size === 'lg' ? '2.5rem' : '3rem'

  const hatOffset = size === 'sm' ? '-0.4rem' : size === 'md' ? '-0.8rem' : size === 'lg' ? '-1.5rem' : '-2rem'
  const glassesOffset = size === 'sm' ? '0.2rem' : size === 'md' ? '0.4rem' : size === 'lg' ? '0.8rem' : '1.2rem'

  return (
    <div className="relative inline-flex flex-center" style={{ fontSize }}>
      <span>👤</span>
      
      {config?.hat && (
        <div className="absolute" style={{ top: hatOffset, left: '50%', transform: 'translateX(-50%)', fontSize: hatSize, zIndex: 10 }}>
          {config.hat === 'straw_hat' && '👒'}
          {config.hat === 'red_cap' && '🧢'}
          {config.hat === 'golden_crown' && '👑'}
        </div>
      )}

      {config?.glasses && (
        <div className="absolute" style={{ top: glassesOffset, left: '50%', transform: 'translateX(-50%)', fontSize: glassesSize, opacity: 0.9 }}>
          {config.glasses === 'cool_shades' && '🕶️'}
        </div>
      )}
    </div>
  )
}
