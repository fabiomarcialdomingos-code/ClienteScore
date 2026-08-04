import styles from '../styles/landing.module.css'
import LandingDemo from '../components/features/LandingDemo'

export const metadata = {
  title: 'ClienteScore — cada elogio vira pontuação (e cliente)',
  description: 'O ClienteScore transforma cada avaliação dos seus clientes em post pronto pro Instagram e nota no Google — e te mostra, num placar só, o quanto a sua reputação está subindo.',
}

const SEGMENTS = ['💈 Barbearias', '✨ Clínicas de Estética', '🐾 Pet Shops', '🦷 Consultórios', '🍕 Restaurantes', '💅 Salões de Beleza', '🔧 Prestadores de Serviço', '🏋️ Academias']

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ClienteScore',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '79', priceCurrency: 'BRL' },
}

export default function LandingPage() {
  return (
    <div className={styles.root}>
      <div className={styles.dots} />
      <div className={styles.glow} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className={styles.topbar}>
        <a className={styles.logo} href="/"><span className={styles.logoMark}>★</span>Cliente<span className={styles.amber}>Score</span></a>
        <nav className={styles.topnav}>
          <a href="#como-funciona">Como funciona</a>
          <a href="#score">O placar</a>
          <a href="#preco">Preço</a>
          <a href="#faq">Dúvidas</a>
        </nav>
        <a className={styles.btnPrimary} href="/login">Testar grátis</a>
      </header>

      <main>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>⚡ Feito pro pequeno negócio brasileiro</span>
            <h1 className={styles.h1}>Cada elogio <span className={styles.em}>soma</span>.<br />Cada estrela vira <span className={styles.em}>cliente</span>.</h1>
            <p className={styles.lead}>O ClienteScore transforma cada avaliação dos seus clientes em post pronto pro Instagram e nota no Google — e ainda te mostra, num placar só, o quanto a sua reputação está subindo.</p>
            <div className={styles.heroCta}>
              <a className={styles.btnPrimary} href="/login">Quero testar grátis →</a>
              <a className={styles.btnGhost} href="#como-funciona">Ver como funciona</a>
            </div>
            <p className={styles.trust}><b>Sem agência</b> · <b>Sem Canva</b> · <b>Sem bloqueio criativo</b></p>
          </div>
          <div className={styles.demoCol}>
            <LandingDemo />
          </div>
        </section>

        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...SEGMENTS, ...SEGMENTS].map((s, i) => (<span key={i}>{s} <b>✦</b></span>))}
          </div>
        </div>

        <section className={styles.section}>
          <div className={styles.wrap}>
            <div className={styles.problemGrid}>
              <div className={styles.reveal} data-reveal>
                <span className={styles.eyebrow}>O problema real</span>
                <h2 className={styles.h2} style={{ fontSize: 'clamp(28px,4.4vw,42px)', lineHeight: 1.2 }}>São 23h47. Você fechou a loja há 2 horas. E o post de amanhã ainda <span className={styles.span}>não existe</span>.</h2>
                <p className={styles.p} style={{ color: 'var(--muted)', fontSize: '16.5px', marginTop: 18 }}>Você sabe que precisa de presença digital e prova social. Mas não tem tempo, não quer pagar <b style={{ color: 'var(--coral)' }}>R$ 1.500–3.000/mês</b> pra uma agência, e detesta ficar encarando tela em branco tentando inventar legenda. Resultado: mais um dia sem postar — e os elogios que você recebeu hoje se perdem pra sempre.</p>
              </div>
              <div className={styles.reveal} data-reveal>
                <div className={styles.canvasMock}>
                  <div className={styles.cmTop}><span className={styles.dot} style={{ background: '#FF6B5E' }} /><span className={styles.dot} style={{ background: '#F5B841' }} /><span className={styles.dot} style={{ background: '#3ECF8E' }} />&nbsp;post-instagram-final-v3.crv</div>
                  <div className={styles.cmBody}>
                    <div className={styles.cmLine} style={{ width: '80%' }} />
                    <div className={styles.cmLine} style={{ width: '55%' }} />
                    <div className={styles.cmCursorRow}><span className={styles.cmCursor} />&nbsp;Digite uma legenda criativa…</div>
                  </div>
                  <div className={styles.cmTime}>23:47 · você já escreveu e apagou 3 legendas</div>
                </div>
              </div>
            </div>
            <p className={styles.bridge} data-reveal>E se cada elogio que você <span className={styles.span}>já recebe</span> virasse score — <span className={styles.span}>sozinho</span>?</p>
          </div>
        </section>

        <section className={styles.section} id="como-funciona">
          <div className={styles.wrap}>
            <div className={styles.secHead} data-reveal>
              <span className={styles.eyebrow}>Como funciona</span>
              <h2 className={styles.h2}>Do elogio ao post em <span className={styles.span}>5 passos</span> — sem você tocar em nada.</h2>
            </div>
            <div className={styles.flow}>
              <div className={styles.step} data-reveal>
                <div className={styles.num}>1</div>
                <div className={styles.stepBody}><h3 className={styles.h3}>O cliente escaneia o QR Code</h3><p className={styles.p}>No balcão, na mesa ou pelo WhatsApp pós-atendimento. Ele cai numa página limpa, com a sua marca, feita pra celular.</p></div>
                <div className={styles.stepVis}><img width="64" height="64" style={{ borderRadius: 8, border: '1px solid rgba(245,184,65,.35)' }} src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Fclientescore.com.br%2Ffigaro&bgcolor=0d1424&color=f5b841" alt="QR Code de exemplo" /></div>
              </div>
              <div className={styles.step} data-reveal>
                <div className={styles.num}>2</div>
                <div className={styles.stepBody}><h3 className={styles.h3}>Deixa uma nota de 1 a 5 estrelas</h3><p className={styles.p}>Uma tela, dois toques. Rápido o suficiente pra ninguém desistir no meio.</p></div>
                <div className={styles.stepVis}><span className={styles.miniStars}>★★★★★</span></div>
              </div>
              <div className={styles.step} data-reveal>
                <div className={styles.num}>3</div>
                <div className={styles.stepBody}>
                  <h3 className={styles.h3}>O sistema decide o destino — sozinho</h3>
                  <p className={styles.p}>Análise inteligente da satisfação, em tempo real:</p>
                  <div className={styles.branchBox}>
                    <div className={styles.branchGood}><h4 className={styles.h4}>⭐ 4–5 estrelas</h4><p className={styles.p}>Vai pro Google (SEO local) e entra no motor de posts.</p></div>
                    <div className={styles.branchBad}><h4 className={styles.h4}>🔒 1–3 estrelas</h4><p className={styles.p}>Vai em sigilo pro seu WhatsApp. Nada vaza. Reputação blindada.</p></div>
                  </div>
                </div>
              </div>
              <div className={styles.step} data-reveal>
                <div className={styles.num}>4</div>
                <div className={styles.stepBody}><h3 className={styles.h3}>O motor gera arte + legenda</h3><p className={styles.p}>Em segundos, o elogio vira uma arte com a sua marca e uma legenda persuasiva pronta pra usar.</p></div>
                <div className={styles.stepVis}><span className={styles.miniArt}>★</span></div>
              </div>
              <div className={styles.step} data-reveal>
                <div className={styles.num}>5</div>
                <div className={styles.stepBody}><h3 className={styles.h3}>Você publica em 1 clique — e o score sobe</h3><p className={styles.p}>Notificação &ldquo;Novo post pronto 🚀&rdquo;, você toca em publicar e pronto. Ou agenda. E o placar soma: avaliações, posts, reputação.</p></div>
                <div className={styles.stepVis}><span className={styles.miniBtn}>🚀 Postar</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="score">
          <div className={styles.wrap}>
            <div className={`${styles.secHead} ${styles.center}`} data-reveal>
              <span className={styles.eyebrow}>O placar</span>
              <h2 className={styles.h2}>O número que <span className={styles.span}>ninguém te mostra</span>.</h2>
              <p className={styles.p}>Enquanto você atende, o ClienteScore soma. Aqui está o que uma barbearia de verdade viu em 30 dias.</p>
            </div>
            <div className={styles.scoreGrid} data-ring>
              <div className={styles.scoreRingWrap}>
                <div className={styles.ring}>
                  <svg viewBox="0 0 200 200">
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FFCE63" />
                        <stop offset="100%" stopColor="#3ECF8E" />
                      </linearGradient>
                    </defs>
                    <circle className={styles.ringBg} cx="100" cy="100" r="90" />
                    <circle className={styles.ringFill} cx="100" cy="100" r="90" />
                  </svg>
                  <div className={styles.ringNum}><b data-countup="92">0</b><small>de 100</small></div>
                </div>
                <p className={styles.ringLabel}>Score de reputação — a nota que o mercado vê quando pesquisa você.</p>
                <span className={styles.ringNote}>exemplo ilustrativo</span>
              </div>
              <div className={styles.drivers}>
                <div className={styles.driver}>
                  <div className={styles.driverTop}><span className={styles.lbl}>Avaliações 4–5★ recebidas</span><span className={styles.val} data-countup="128">0</span></div>
                  <div className={styles.driverBar}><div className={styles.driverFill} style={{ ['--w']: '92%' }} /></div>
                </div>
                <div className={styles.driver}>
                  <div className={styles.driverTop}><span className={styles.lbl}>Posts publicados a partir delas</span><span className={styles.val} data-countup="34">0</span></div>
                  <div className={styles.driverBar}><div className={styles.driverFill} style={{ ['--w']: '64%' }} /></div>
                </div>
                <div className={styles.driver}>
                  <div className={styles.driverTop}><span className={styles.lbl}>Feedbacks negativos resolvidos no privado</span><span className={styles.val} data-countup="100">0</span></div>
                  <div className={styles.driverBar}><div className={styles.driverFill} style={{ ['--w']: '100%' }} /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.wrap}>
            <div className={styles.secHead} data-reveal>
              <span className={styles.eyebrow}>Faça as contas</span>
              <h2 className={styles.h2}>Agência cobra até R$ 3.000. Nós cobramos <span className={styles.span}>R$ 79</span>.</h2>
            </div>
            <div className={styles.versus}>
              <div className={`${styles.vCol} ${styles.vOld}`} data-reveal>
                <h3 className={styles.h3}>Do jeito antigo</h3>
                <div className={styles.vPrice}><s>R$ 1.500–3.000</s>/mês</div>
                <p className={styles.vSub}>agência · ou suas noites no Canva</p>
                <ul>
                  <li>Você pensa no que postar</li>
                  <li>Arte genérica, feita de modelo</li>
                  <li>Legenda travada no bloqueio criativo</li>
                  <li>Elogios dos clientes se perdem</li>
                  <li>Cliente foi embora? Avaliação perdida</li>
                  <li>Post sai dias depois (se sair)</li>
                </ul>
              </div>
              <div className={styles.vDivider} data-reveal>VS</div>
              <div className={`${styles.vCol} ${styles.vNew}`} data-reveal>
                <h3 className={styles.h3}>Com o ClienteScore</h3>
                <div className={styles.vPrice}>R$ 79/mês</div>
                <p className={styles.vSub}>menos que um lanche por dia</p>
                <ul>
                  <li>Posts prontos sozinhos, todo dia</li>
                  <li>Voz real dos seus clientes</li>
                  <li>Legenda persuasiva automática</li>
                  <li>Todo elogio vira marketing</li>
                  <li>Convites resgatam quem não avaliou</li>
                  <li>Placar de score subindo em tempo real</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="preco">
          <div className={styles.wrap}>
            <div className={`${styles.secHead} ${styles.center}`} data-reveal>
              <span className={styles.eyebrow}>Preço</span>
              <h2 className={styles.h2}>Um plano único. <span className={styles.span}>Tudo incluso.</span></h2>
            </div>
            <div className={styles.plan} data-reveal>
              <div className={styles.planBadge}>Plano único · sem pegadinha</div>
              <div className={styles.priceRow}>
                <div className={`${styles.priceCard} ${styles.priceMain}`}>
                  <span className={styles.cur}>R$</span><span className={styles.val}>79</span><span className={styles.per}>/mês</span>
                  <span className={styles.tag2}>cobrado mensalmente</span>
                </div>
                <div className={`${styles.priceCard} ${styles.priceAlt}`}>
                  <span className={styles.cur}>R$</span><span className={styles.val}>57</span><span className={styles.per}>/mês</span>
                  <span className={styles.save}>ANUAL · −28%</span>
                  <span className={styles.tag2}>economize R$ 264/ano</span>
                </div>
              </div>
              <ul className={styles.planFeats}>
                <li>QR Codes ilimitados</li>
                <li>Avaliações ilimitadas</li>
                <li>Posts automáticos (arte + legenda)</li>
                <li>Proteção de reputação</li>
                <li>Convites por WhatsApp</li>
                <li>Comunicados (promo/horário/status)</li>
                <li>Lista de clientes com opt-in</li>
                <li>Placar de score ao vivo</li>
                <li>Relatórios de impacto</li>
                <li>Suporte em português</li>
              </ul>
              <a className={styles.btnPrimary} href="/login">Começar 7 dias grátis</a>
              <p className={styles.planFine}>Sem cartão para testar · Sem fidelidade · Cancele em 1 clique</p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="faq">
          <div className={styles.wrap}>
            <div className={styles.secHead} data-reveal>
              <span className={styles.eyebrow}>Dúvidas</span>
              <h2 className={styles.h2}>Quem já usa <span className={styles.span}>também tinha</span> essas dúvidas.</h2>
            </div>
            <div className={styles.faq}>
              <details className={styles.faqItem} data-reveal>
                <summary className={styles.faqQ}>O que é esse &ldquo;score&rdquo;?<span className={styles.ic}>+</span></summary>
                <div className={styles.faqA}><div><p>É a pontuação de reputação do seu negócio, calculada a partir das avaliações que entram, dos posts que você publica e dos feedbacks que você resolve. Em vez de &ldquo;quantos elogios eu tive&rdquo;, você passa a ver &ldquo;o quanto a minha nota está subindo&rdquo; — e é isso que traz cliente novo.</p></div></div>
              </details>
              <details className={styles.faqItem} data-reveal>
                <summary className={styles.faqQ}>Preciso entender de marketing ou design?<span className={styles.ic}>+</span></summary>
                <div className={styles.faqA}><div><p>Não. Essa é justamente a ideia: o sistema cria a arte e a legenda sozinho. Você só toca em &ldquo;postar&rdquo;. Se souber usar WhatsApp, sabe usar o ClienteScore.</p></div></div>
              </details>
              <details className={styles.faqItem} data-reveal>
                <summary className={styles.faqQ}>E se um cliente fizer uma reclamação?<span className={styles.ic}>+</span></summary>
                <div className={styles.faqA}><div><p>É o nosso recurso favorito: notas de 1 a 3 estrelas vão em sigilo direto pro seu WhatsApp — nada é publicado no Google ou nas redes. Você resolve no privado e protege sua reputação.</p></div></div>
              </details>
              <details className={styles.faqItem} data-reveal>
                <summary className={styles.faqQ}>E se o cliente for embora sem avaliar?<span className={styles.ic}>+</span></summary>
                <div className={styles.faqA}><div><p>Acontece muito — e é pra isso que existe a esteira de atendimento. Você dá o ✓ quando atende, e o sistema cuida do convite na hora certa, sem você lembrar.</p></div></div>
              </details>
              <details className={styles.faqItem} data-reveal>
                <summary className={styles.faqQ}>Funciona no meu celular?<span className={styles.ic}>+</span></summary>
                <div className={styles.faqA}><div><p>Sim, 100%. Tudo roda no navegador, sem instalar nada — nem pra você, nem pro seu cliente. O painel foi desenhado primeiro para o celular, que é onde você vive.</p></div></div>
              </details>
              <details className={styles.faqItem} data-reveal>
                <summary className={styles.faqQ}>Posso cancelar quando quiser?<span className={styles.ic}>+</span></summary>
                <div className={styles.faqA}><div><p>Sim. Sem multa, sem fidelidade, sem ligação de retenção. Você cancela em 1 clique no próprio painel. E tem 7 dias grátis pra testar sem cartão.</p></div></div>
              </details>
            </div>
          </div>
        </section>

        <section className={styles.final}>
          <div className={styles.starsRow} aria-hidden="true"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <h2 className={styles.h2}>Pare de pensar no que postar.<br />Comece a somar score.</h2>
          <p className={styles.p}>Em 5 minutos seu QR Code está pronto e o primeiro post, a caminho.</p>
          <a className={styles.btnPrimary} href="/login">Criar minha página grátis →</a>
          <p className={styles.planFine}>7 dias grátis · sem cartão · sem fidelidade</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.foot}>
          <a className={styles.logo} href="/" style={{ fontSize: 16 }}><span className={styles.logoMark} style={{ width: 26, height: 26, fontSize: 14 }}>★</span>Cliente<span className={styles.amber}>Score</span></a>
          <p className={styles.tag}>Feito com ⚡ pro pequeno negócio brasileiro · clientescore.com.br</p>
          <nav>
            <a href="#como-funciona">Como funciona</a>
            <a href="#preco">Preço</a>
            <a href="#faq">Dúvidas</a>
            <a href="/termos">Termos</a>
            <a href="/privacidade">Privacidade</a>
          </nav>
          <p className={styles.tag}>© 2026 ClienteScore</p>
        </div>
      </footer>
    </div>
  )
}