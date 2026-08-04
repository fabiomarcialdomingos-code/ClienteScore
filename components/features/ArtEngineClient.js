'use client'
import dynamic from 'next/dynamic'

// O Next 16 proíbe ssr:false em Server Component; aqui (client) é permitido.
// Mantém o motor isolado num chunk separado: se ele espirrar, o /app não cai junto.
const ArtEngine = dynamic(() => import('./ArtEngine'), { ssr: false })

export default function ArtEngineClient(props) {
  return <ArtEngine {...props} />
}