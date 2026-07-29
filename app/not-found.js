import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <div className="df-stripes" />
      <div className="df-glow" />
      <main className="df-404">
        <div className="star">★</div>
        <h1>404</h1>
        <p>Essa página de avaliação não existe (ou ainda não foi criada). Que tal criar a sua?</p>
        <Link href="/">Criar minha página grátis →</Link>
      </main>
    </>
  )
}