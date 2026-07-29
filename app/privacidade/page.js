import LegalReader from '../LegalReader'
import styles from '../legal.module.css'

export const metadata = {
  title: 'Política de Privacidade · ClienteScore',
  description: 'Como o ClienteScore trata os dados de quem usa o serviço e de quem avalia um negócio.',
}

const TOC = [
  ['quem', 'Quem somos'], ['dados', 'Que dados coletamos'], ['base', 'Por que tratamos (base legal)'],
  ['cookies', 'Cookies'], ['compartilha', 'Com quem compartilhamos'], ['direitos', 'Seus direitos'],
  ['retencao', 'Retenção'], ['seguranca', 'Segurança'], ['criancas', 'Crianças'],
  ['mudancas', 'Mudanças'], ['contato', 'Contato'],
]

export default function PrivacidadePage() {
  return (
    <div className={styles.root}>
      <div className={styles.dots} />
      <div className={styles.glow} />
      <LegalReader />

      <header className={styles.topbar}>
        <a className={styles.logo} href="/"><span className={styles.logoMark}>★</span><span>Cliente<span className={styles.amber}>Score</span></span></a>
        <span className={styles.crumb}>› privacidade</span>
        <a className={styles.back} href="/">← voltar</a>
      </header>

      <div className={styles.shell}>
        <aside className={styles.toc}>
          <div className={styles.tocLabel}>Nesta página</div>
          {TOC.map(([id, t]) => (<a key={id} href={'#' + id} data-toc={id}>{t}</a>))}
        </aside>

        <article>
          <div className={styles.head}>
            <span className={styles.kicker}>🔒 Privacidade & LGPD</span>
            <h1 className={styles.h1}>Política de Privacidade</h1>
            <p className={styles.updated}>Última atualização: 28 de julho de 2026</p>
            <div className={styles.draft}><span>⚠️</span><span><b>Rascunho para revisão.</b> Este texto é um modelo baseado no funcionamento real do sistema e deve ser revisado por um advogado antes de entrar em produção com clientes reais.</span></div>
          </div>

          <section id="quem" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>01</span><h2>Quem somos</h2></div>
            <p>O <b>ClienteScore</b> é uma plataforma que ajuda pequenos negócios a transformar a opinião dos seus clientes em avaliações no Google e em posts prontos para as redes sociais. Esta política explica que informações coletamos, por que coletamos e quais são os seus direitos.</p>
          </section>

          <section id="dados" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>02</span><h2>Que dados coletamos</h2></div>
            <p><b>Do dono do negócio (conta):</b> nome, e-mail, nome do negócio, endereço público da página (slug) e a cor/segmento da marca. Esses dados são necessários para criar e operar a sua página.</p>
            <p><b>De quem avalia um negócio (cliente final):</b> a nota de 1 a 5, o texto do depoimento e, <b>se a pessoa quiser informar</b>, o nome e o WhatsApp. O nome e o WhatsApp são sempre opcionais. Também registramos dois consentimentos explícitos: a autorização de uso do depoimento e o opt-in de marketing (receber novidades do negócio).</p>
            <p><b>Dados técnicos:</b> cookies de sessão (para manter o dono logado) e, com permissão, cookies de análise para entender o uso do produto. Não coletamos localização precisa nem dados biométricos.</p>
          </section>

          <section id="base" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>03</span><h2>Por que tratamos (base legal)</h2></div>
            <ul>
              <li><b>Execução de contrato:</b> para entregar o serviço que o dono contratou (página, placar, posts).</li>
              <li><b>Consentimento:</b> para publicar o depoimento do cliente final e para o opt-in de marketing — ambos podem ser revogados a qualquer momento.</li>
              <li><b>Legítimo interesse:</b> para segurança, prevenção de abuso e melhoria do serviço, sempre de forma proporcional.</li>
            </ul>
          </section>

          <section id="cookies" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>04</span><h2>Cookies</h2></div>
            <p>Usamos <b>cookies essenciais</b> (ex.: manter a sessão do dono) que não dependem de consentimento, porque o serviço não funciona sem eles. Cookies de <b>análise</b> só são ativados se você aceitar no banner. Você pode mudar de ideia a qualquer momento limpando os cookies do navegador.</p>
            <div className={styles.note}><b>Nota:</b> o banner de cookies não é exibido dentro do painel do dono (<code>/app</code>), apenas nas áreas públicas.</div>
          </section>

          <section id="compartilha" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>05</span><h2>Com quem compartilhamos</h2></div>
            <p>Os dados ficam armazenados em infraestrutura de hospedagem e banco de dados (Supabase/Vercel). <b>Não vendemos dados.</b> O depoimento e o nome do cliente final só se tornam públicos se o próprio cliente autorizar; o WhatsApp do cliente final, quando informado, é usado apenas para o canal de convite/contato do negócio que ele avaliou. Dados do cliente final não são enviados a redes sociais pelo ClienteScore — a publicação é sempre um ato do dono, no canal dele.</p>
          </section>

          <section id="direitos" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>06</span><h2>Seus direitos</h2></div>
            <p>Você pode, a qualquer momento, pedir <b>acesso, correção, exclusão e portabilidade</b> dos seus dados, além de <b>revogar o consentimento</b> e o opt-in de marketing. O dono gerencia sua conta pelo painel; o cliente final pode solicitar a exclusão do seu depoimento pelo canal de contato abaixo, e o negócio responsável pelo tratamento direto também pode removê-lo.</p>
          </section>

          <section id="retencao" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>07</span><h2>Retenção</h2></div>
            <p>Mantemos os dados da conta enquanto ela estiver ativa e pelo prazo legal necessário após o encerramento. Depoimentos e feedbacks permanecem enquanto forem úteis ao negócio e até que seja solicitada a exclusão. Feedbacks privados (notas baixas) nunca são publicados e são tratados como confidenciais.</p>
          </section>

          <section id="seguranca" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>08</span><h2>Segurança</h2></div>
            <p>Aplicamos controles de acesso por dono (cada negócio enxerga apenas os seus próprios dados), conexão criptografada e boas práticas de armazenamento. Nenhum sistema é infalível; por isso limitamos a coleta ao necessário e revisamos continuamente os acessos.</p>
          </section>

          <section id="criancas" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>09</span><h2>Crianças</h2></div>
            <p>O serviço não é direcionado a crianças. Não coletamos intencionalmente dados de menores. Se você acredita que isso ocorreu, entre em contato para que possamos remover as informações.</p>
          </section>

          <section id="mudancas" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>10</span><h2>Mudanças nesta política</h2></div>
            <p>Podemos atualizar esta política para refletir mudanças no produto ou na lei. A data no topo indica a última revisão. Mudanças relevantes serão comunicadas pelo painel ou por e-mail.</p>
          </section>

          <section id="contato" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>11</span><h2>Contato</h2></div>
            <p>Dúvidas sobre privacidade ou pedidos de titular: <b>[seu-e-mail-de-contato@clientescore.com.br]</b>. Substitua este endereço pelo canal oficial antes de publicar.</p>
          </section>

          <div className={styles.legalFoot}>
            <nav><a href="/termos">Termos de Uso</a><a href="/privacidade">Privacidade</a><a href="/">Início</a></nav>
            <span className={styles.tag}>© 2026 ClienteScore</span>
          </div>
        </article>
      </div>
    </div>
  )
}