import LegalReader from '../LegalReader'
import styles from '../legal.module.css'

export const metadata = {
  title: 'Termos de Uso · ClienteScore',
  description: 'Regras de uso do ClienteScore: conta, plano, uso aceitável e responsabilidades.',
}

const TOC = [
  ['aceite', 'Aceitação'], ['conta', 'A sua conta'], ['servico', 'O que o serviço faz (e não faz)'],
  ['uso', 'Uso aceitável'], ['plano', 'Plano, teste e pagamento'], ['suspensao', 'Suspensão e encerramento'],
  ['pi', 'Propriedade intelectual'], ['resp', 'Limitação de responsabilidade'], ['lei', 'Lei e foro'],
  ['mudancas', 'Mudanças'], ['contato', 'Contato'],
]

export default function TermosPage() {
  return (
    <div className={styles.root}>
      <div className={styles.dots} />
      <div className={styles.glow} />
      <LegalReader />

      <header className={styles.topbar}>
        <a className={styles.logo} href="/"><span className={styles.logoMark}>★</span><span>Cliente<span className={styles.amber}>Score</span></span></a>
        <span className={styles.crumb}>› termos</span>
        <a className={styles.back} href="/">← voltar</a>
      </header>

      <div className={styles.shell}>
        <aside className={styles.toc}>
          <div className={styles.tocLabel}>Nesta página</div>
          {TOC.map(([id, t]) => (<a key={id} href={'#' + id} data-toc={id}>{t}</a>))}
        </aside>

        <article>
          <div className={styles.head}>
            <span className={styles.kicker}>📄 Regras do jogo</span>
            <h1 className={styles.h1}>Termos de Uso</h1>
            <p className={styles.updated}>Última atualização: 28 de julho de 2026</p>
            <div className={styles.draft}><span>⚠️</span><span><b>Rascunho para revisão.</b> Este texto é um modelo baseado no funcionamento real do sistema e deve ser revisado por um advogado antes de entrar em produção com clientes reais.</span></div>
          </div>

          <section id="aceite" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>01</span><h2>Aceitação</h2></div>
            <p>Ao criar uma conta e usar o <b>ClienteScore</b>, você concorda com estes Termos. Se não concordar, não utilize o serviço. O uso contínuo após mudanças nos Termos significa aceitação da nova versão.</p>
          </section>

          <section id="conta" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>02</span><h2>A sua conta</h2></div>
            <p>Você é responsável por manter o acesso à sua conta em segurança e por tudo o que acontece nela. Forneça informações verdadeiras. Cada conta corresponde a um responsável; o uso de uma mesma conta por várias pessoas não é suportado.</p>
          </section>

          <section id="servico" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>03</span><h2>O que o serviço faz (e não faz)</h2></div>
            <p>O ClienteScore oferece uma página de avaliação, geração de posts a partir de elogios, a esteira de atendimento, comunicados e um placar de reputação. <b>Importante:</b> o sistema <b>não publica automaticamente</b> nas redes sociais do dono — a publicação é sempre um ato dele. O sistema também <b>não garante</b> posicionamento no Google nem um número mínimo de avaliações; ele fornece as ferramentas para que o negócio as conquiste.</p>
          </section>

          <section id="uso" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>04</span><h2>Uso aceitável</h2></div>
            <p>Você concorda em usar o serviço de boa-fé e em conformidade com a lei. Em especial, <b>não envie convites em massa para pessoas que não foram suas clientes</b> (spam): os convites devem ir apenas para quem você atendeu e que te passou o contato, uma mensagem educada, pelo seu número. O descumprimento pode resultar em suspensão, pois protege a reputação de todos.</p>
          </section>

          <section id="plano" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>05</span><h2>Plano, teste e pagamento</h2></div>
            <p>O plano é único, com teste gratuito de 7 dias sem cartão. Após o teste, a cobrança é <b>R$ 79/mês</b> (mensal) ou <b>R$ 57/mês</b> no anual. Você pode cancelar a qualquer momento, sem fidelidade, pelo próprio painel. O acesso é mantido até o fim do período já pago.</p>
          </section>

          <section id="suspensao" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>06</span><h2>Suspensão e encerramento</h2></div>
            <p>Podemos suspender ou encerrar contas em caso de inadimplência, violação destes Termos, uso fraudulento ou que coloque outros usuários em risco. Você pode encerrar sua conta a qualquer momento; os efeitos sobre os dados estão descritos na Política de Privacidade.</p>
          </section>

          <section id="pi" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>07</span><h2>Propriedade intelectual</h2></div>
            <p>O ClienteScore (marca, layout e motor de geração) é de nossa propriedade. O conteúdo que você e seus clientes produzem (depoimentos, artes geradas a partir deles) pertence a você, e você nos autoriza a processá-lo para entregar o serviço.</p>
          </section>

          <section id="resp" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>08</span><h2>Limitação de responsabilidade</h2></div>
            <p>O serviço é entregue "como está". Na máxima extensão permitida por lei, não nos responsabilizamos por lucros cessantes ou danos indiretos, nem por conteúdos publicados pelo dono em seus canais a partir das ferramentas. Nossa responsabilidade, quando reconhecida, limita-se ao valor pago nos 3 meses anteriores ao fato.</p>
          </section>

          <section id="lei" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>09</span><h2>Lei e foro</h2></div>
            <p>Estes Termos são regidos pelas leis do Brasil, incluindo o Código de Defesa do Consumidor e a LGPD. Fica eleito o foro da comarca do responsável pelo ClienteScore para dirimir controvérsias, salvo quando a lei consumerista determinar outro.</p>
          </section>

          <section id="mudancas" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>10</span><h2>Mudanças nos Termos</h2></div>
            <p>Podemos revisar estes Termos. A data no topo indica a última versão. Para mudanças relevantes, avisaremos pelo painel ou por e-mail com antecedência razoável.</p>
          </section>

          <section id="contato" data-sec data-reveal className={styles.sec}>
            <div className={styles.secH}><span className={styles.secN}>11</span><h2>Contato</h2></div>
            <p>Fale conosco em <b>[seu-e-mail-de-contato@clientescore.com.br]</b>. Substitua este endereço pelo canal oficial antes de publicar.</p>
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