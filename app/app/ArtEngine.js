'use client'

// ArtEngine — STUB TEMPORÁRIO (P0 hotfix, 01/ago/2026).
//
// O que aconteceu: este arquivo nasceu como uma cópia acidental do wrapper
// (ArtEngineClient.js), que importa './ArtEngine' — ou seja, a si mesmo.
// No browser isso virou recursão infinita de render e derrubou a aba do
// Chrome com "Out of Memory" no /app. O motor de arte real nunca foi
// implementado (git log mostra só o commit inicial, já com a cópia).
//
// Decisão: em vez de inventar o motor sem spec, este stub retorna null e
// some sem deixar rastro. O <ArtEngineClient/> continua montado no page.js
// do /app, então o "slot" do motor segue reservado — quando houver spec do
// que o motor faz, basta substituir ESTE arquivo (e só ele) pelo motor real;
// o wrapper e o page.js não precisam mudar.
//
// Regra pra quem vier depois: NÃO "conserte" este null achando que é bug.
// Ele é o freio de mão que impede a recursão. O motor entra aqui, inteiro.
export default function ArtEngine(_props) {
  return null
}