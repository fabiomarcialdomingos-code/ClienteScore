import { Alfa_Slab_One, Sora } from 'next/font/google'
import './globals.css'
import CookieBanner from '../components/layout/CookieBanner'

const display = Alfa_Slab_One({ weight: '400', subsets: ['latin'], variable: '--font-display' })
const body = Sora({ weight: ['400', '600', '700', '800'], subsets: ['latin'], variable: '--font-body' })

export const metadata = {
  title: 'ClienteScore',
  description: 'Transforme elogios em avaliações no Google e posts prontos em 1 clique.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>{children}<CookieBanner /></body>
    </html>
  )
}