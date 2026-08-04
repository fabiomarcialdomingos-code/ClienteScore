# Reestruturação do Código - ClienteScore

## Nova Estrutura de Diretórios

```
/workspace/
├── app/                          # Rotas Next.js (App Router)
│   ├── [slug]/                   # Página de avaliação dinâmica
│   │   ├── actions.js            # Server actions para reviews
│   │   ├── page.js               # Página principal
│   │   └── post-actions.js       # Server actions para posts
│   ├── api/                      # API routes
│   │   └── wa-webhook/
│   │       └── route.js
│   ├── dashboard/                # Dashboard principal (antigo /app)
│   │   └── page.js
│   ├── login/                    # Autenticação
│   │   ├── auth-actions.js       # Server actions de auth
│   │   └── page.js
│   ├── onboarding/               # Onboarding de novos usuários
│   │   ├── page.js
│   │   └── tenant-actions.js     # Server actions para tenants
│   ├── privacidade/              # Página de privacidade
│   │   └── page.js
│   ├── termos/                   # Página de termos
│   │   └── page.js
│   ├── wa-test/                  # Testes WhatsApp
│   │   ├── actions.js
│   │   └── page.js
│   ├── globals.css               # CSS global
│   ├── layout.js                 # Layout root
│   ├── not-found.js              # Página 404
│   └── page.js                   # Landing page
│
├── components/                   # Componentes React
│   ├── features/                 # Componentes específicos da aplicação
│   │   ├── ArtEngine.js          # Motor de geração de arte
│   │   ├── ArtEngineClient.js    # Cliente do motor de arte
│   │   ├── AuthForm.js           # Formulário de autenticação
│   │   ├── BeltControls.js       # Controles da cinta
│   │   ├── BeltSection.js        # Seção da cinta
│   │   ├── ComunicadosComposer.js # Compositor de comunicados
│   │   ├── ComunicadosSection.js # Seção de comunicados
│   │   ├── CountUp.js            # Componente de contagem
│   │   ├── LandingDemo.js        # Demo da landing page
│   │   ├── LegalReader.js        # Leitor de documentos legais
│   │   ├── LogoLink.js           # Link do logo
│   │   ├── OnboardingForm.js     # Formulário de onboarding
│   │   ├── PostsQueue.js         # Fila de posts
│   │   ├── ReviewClient.js       # Cliente de review
│   │   └── ServiceBelt.js        # Cinta de serviços
│   ├── layout/                   # Componentes de layout
│   │   └── CookieBanner.js       # Banner de cookies
│   └── ui/                       # Componentes UI genéricos (vazio)
│
├── lib/                          # Utilitários e integrações
│   ├── branding.js               # Funções de branding
│   ├── belt-actions.js           # Server actions da cinta (movido de /app/app)
│   ├── supabase/
│   │   └── server.js             # Cliente Supabase SSR
│   ├── supabase.js               # Cliente Supabase
│   └── whatsapp.js               # Integração WhatsApp
│
├── styles/                       # Arquivos CSS
│   ├── auth.module.css           # Estilos de autenticação
│   ├── dashboard.module.css      # Estilos do dashboard
│   ├── landing-page.module.css   # Estilos da landing page
│   ├── landing.module.css        # Módulo landing
│   ├── legal.module.css          # Estilos de páginas legais
│   └── onboarding.module.css     # Estilos de onboarding
│
├── hooks/                        # Custom hooks React (vazio)
├── utils/                        # Funções utilitárias (vazio)
├── public/                       # Assets estáticos
├── middleware.js                 # Middleware Next.js
├── next.config.js                # Configuração Next.js
└── package.json                  # Dependências
```

## Mudanças Principais

### 1. Separação de Responsabilidades
- **components/**: Todos os componentes UI isolados das rotas
- **styles/**: Todos os CSS modules centralizados
- **app/**: Apenas rotas e server actions específicas de cada feature
- **lib/**: Utilitários, integrações e shared logic

### 2. Componentes Movidos
- `CookieBanner.js` → `components/layout/`
- `LandingDemo.js` → `components/features/`
- `LegalReader.js` → `components/features/`
- `AuthForm.js` → `components/features/`
- `OnboardingForm.js` → `components/features/`
- `ReviewClient.js` → `components/features/`
- Todos os componentes do dashboard (`ArtEngine`, `BeltControls`, etc.) → `components/features/`

### 3. CSS Centralizado
Todos os `.module.css` agora estão em `/styles/`:
- `auth.module.css`
- `dashboard.module.css` (antes `app.module.css`)
- `landing-page.module.css`
- `landing.module.css`
- `legal.module.css`
- `onboarding.module.css`

### 4. Server Actions por Feature
- `app/login/auth-actions.js` - Login/logout/signup
- `app/onboarding/tenant-actions.js` - Criação de tenant
- `app/[slug]/actions.js` - Salvamento de reviews
- `app/[slug]/post-actions.js` - Ações de post
- `lib/belt-actions.js` - Ações da cinta de serviços

### 5. Imports Atualizados
Os seguintes arquivos tiveram seus imports atualizados:
- ✅ `app/layout.js` - CookieBanner
- ✅ `app/page.js` - LandingDemo e estilos
- ✅ `app/login/page.js` - AuthForm e estilos
- ✅ `app/[slug]/page.js` - ReviewClient
- ✅ `components/features/AuthForm.js` - auth-actions e estilos
- ✅ `components/features/LandingDemo.js` - estilos
- ✅ `components/features/ReviewClient.js` - actions

## Próximos Passos Sugeridos

1. **Atualizar imports restantes** nos componentes do dashboard que usam `@/lib/` ou caminhos relativos antigos
2. **Configurar alias** no `jsconfig.json` para facilitar imports:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"],
         "@/components/*": ["./components/*"],
         "@/styles/*": ["./styles/*"],
         "@/lib/*": ["./lib/*"]
       }
     }
   }
   ```
3. **Mover `belt-actions.js`** para `app/dashboard/actions.js` se for específico do dashboard
4. **Criar índice de exports** em `components/features/index.js` para imports mais limpos
5. **Testar build** com `npm run build` para garantir que todos os imports estão corretos

## Benefícios da Nova Estrutura

✅ **Separação clara** entre rotas, componentes e lógica de negócio  
✅ **CSS centralizado** facilita manutenção e reutilização  
✅ **Componentes reutilizáveis** isolados em pastas dedicadas  
✅ **Server actions próximas** às features que as utilizam  
✅ **Escalabilidade** - fácil adicionar novas features sem poluir `/app`  
✅ **Convenção Next.js** - segue melhores práticas do App Router
