'use client'
// Logo do painel como CLIENT component — único motivo: dar ação ao clique.
//
// Por que NÃO é <Link href="/app"> (a versão que ficou muda no passo 52):
//   o Next, quando você JÁ está em /app e clica num <Link href="/app">, vê que
//   a rota de destino é idêntica à atual e NÃO navega (no-op de propósito). Então
//   o clique "não fazia nada". E o <a href="/app"> antigo, por outro lado,
//   recarregava o documento inteiro = tela branca de 1s (a "câmera-lenta").
//   Nenhum dos dois é o que um logo de painel deve fazer.
//
// O que um logo de painel deve fazer: "recarregar o painel / voltar ao topo".
//   - e.preventDefault() → NÃO recarrega o documento (sem tela branca);
//   - router.refresh()  → refresca só os server components (placar/fila/esteira
//     voltam do banco; os CountUp re-contam de 0 = feedback "vivo" do clique);
//   - scrollTo(top)     → volta ao topo, como um botão de "home".
//
// O href="/app" fica como FALLBACK de acessibilidade/sem-JS: se o JS falhar,
//   degrada pro comportamento antigo (recarrega). Com JS, o onClick vence.
// O markup (classes + spans) é IDÊNTICO ao logo do page.js → zero risco visual.
//
// Regra pra quem vier depois: NÃO troque isto por <Link href="/app"> de novo
//   achando que é "mais correto" — pra mesma rota o Link é mudo. O refresh é
//   a ação certa. Se um dia o logo tiver que ir pra OUTRA rota, aí sim use Link.
import { useRouter } from 'next/navigation'
import styles from './app.module.css'

export default function LogoLink() {
  const router = useRouter()
  const go = (e) => {
    e.preventDefault()              // não recarrega o documento (sem tela branca)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // volta ao topo
    router.refresh()                // refresca os server components (placar/fila/esteira)
  }
  return (
    <a className={styles.logo} href="/app" onClick={go} aria-label="Recarregar painel">
      <span className={styles.logoMark}>★</span>
      <span>Cliente<span className={styles.amber}>Score</span></span>
    </a>
  )
}