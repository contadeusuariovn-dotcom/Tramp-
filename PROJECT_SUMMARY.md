# Lancha Jet Quadriciclo - Projeto Completo

## Visão Geral
Site comercial completo, moderno e profissional para a **Lancha Jet Quadriciclo**, empresa localizada em **Rifaina-SP**, especializada em lanchas, jet skis, buggys e quadriciclos.

**Status:** ✅ Projeto funcional - Build de produção bem-sucedido
**URL Dev:** http://localhost:3001 (ou porta disponível)
**Build:** `dist/` - Pronto para deploy

---

## Estrutura de Pastas

```
lancha-jet/
├── public/
│   ├── images/
│   │   ├── hero/              # Imagens do hero (Represa de Jaguara)
│   │   ├── categories/        # Imagens das categorias
│   │   ├── products/          # Imagens dos produtos (32 arquivos)
│   │   ├── about/             # Imagens sobre a empresa
│   │   ├── rifaina/           # Imagens de Rifaina
│   │   └── catalog/           # Imagens do catálogo
│   ├── models/                # Pasta para modelos 3D (.glb/.gltf) - Fase 2
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/            # Componentes reutilizáveis
│   │   ├── Header.jsx/.css    # Navegação fixa, menu mobile, logo
│   │   ├── Footer.jsx/.css    # Rodapé completo com links, contato, horários
│   │   ├── ProductCard.jsx/.css  # Card de produto (grid/lista)
│   │   └── WhatsAppButton.jsx/.css  # Botão flutuante WhatsApp
│   ├── pages/
│   │   ├── Home.jsx/.css      # Landing page completa
│   │   ├── Catalog.jsx/.css   # Catálogo com filtros, busca, ordenação
│   │   └── ProductDetail.jsx/.css  # Página de detalhes do produto
│   ├── 3d/
│   │   └── Product3DViewer.jsx/.css  # Visualizador 3D (preparado p/ Fase 2)
│   ├── data/
│   │   └── products.js        # 15 produtos demo (3 por categoria)
│   ├── config/
│   │   └── site.config.js     # Configuração centralizada
│   ├── styles/
│   │   ├── variables.css      # Design system (cores, tipografia, spacing)
│   │   └── global.css         # Reset, tipografia, utilitários, animações
│   ├── App.jsx                # Rotas principais
│   └── main.jsx               # Entry point
├── dist/                      # Build de produção
├── index.html                 # HTML com SEO completo
├── vite.config.js             # Configuração Vite com aliases
└── package.json
```

---

## Tecnologias Utilizadas

| Categoria | Tecnologias |
|-----------|-------------|
| **Framework** | React 19 + Vite 6 |
| **Roteamento** | React Router DOM 7 |
| **Estilização** | CSS Custom Properties (Design System) |
| **Ícones** | Lucide React |
| **Formulários** | React Hook Form + Zod |
| **3D (Fase 2)** | Three.js + @react-three/fiber + @react-three/drei |
| **Build** | Vite + Rolldown + Terser |
| **Fonts** | Montserrat (títulos) + Inter (textos) via Google Fonts |

---

## Funcionalidades Implementadas

### ✅ Página Inicial (Home)
- **Hero Section** com imagem cinematográfica da Represa de Jaguara
- Título: "SEU PRÓXIMO DESTINO COMEÇA NA ÁGUA"
- CTAs: "CONHEÇA NOSSO CATÁLOGO" + "FALE COM ESPECIALISTA"
- Indicadores de confiança (experiência, clientes, localização)
- **Seção de Categorias** (4 cards: Lanchas, Jet Skis, Buggys, Quadriciclos)
- **Produtos em Destaque** (6 produtos featured)
- **Sobre a Empresa** com galeria de imagens
- **Seção Rifaina-SP** valorizando a região e Represa de Jaguara
- **Contato** com formulário validado + WhatsApp + Instagram + Localização

### ✅ Catálogo Completo (/catalogo)
- **Busca em tempo real** por nome, marca, modelo
- **Filtros por categoria** (Todos, Lanchas, Jet Skis, Buggys, Quadriciclos)
- **Ordenação** (Destaques, Nome A-Z/Z-A, Ano, Preço)
- **Visualização Grid/Lista** alternável
- **Painel mobile** de filtros colapsável
- Contador de resultados dinâmico
- Botão "Limpar filtros"
- Estado vazio amigável

### ✅ Detalhes do Produto (/produto/:slug)
- **Galeria de imagens** com thumbnails + modal fullscreen
- Navegação por teclado (setas, ESC)
- **Visualizador 3D preparado** (Product3DViewer) - placeholder para Fase 2
- Especificações técnicas organizadas
- Características com checkmarks
- Badges (Destaque, Novo, Indisponível, etc.)
- Preço ou "Consulte"
- **Ações:** WhatsApp direto + Visitar loja
- Compartilhamento nativo (Web Share API) + fallback
- **Produtos relacionados** (mesma categoria)
- Modal de especificações completas

### ✅ Componentes Globais
- **Header fixo** com scroll effect, menu mobile animado
- **Footer completo** com links, contato, horários, badges
- **Botão WhatsApp flutuante** com tooltip + menu expandido
- **ProductCard** reutilizável (variants: default, compact)
- **Animações** de entrada (fadeInUp, stagger)
- **Design System** consistente (cores, tipografia, spacing)

### ✅ SEO & Performance
- Meta tags completas (Open Graph, Twitter Cards)
- Sitemap-ready (robots.txt)
- Lazy loading de imagens
- Code splitting automático (vendor, forms, three, icons)
- Minificação Terser
- Source maps para debug

---

## Identidade Visual

### Paleta de Cores
| Cor | Hex | Uso |
|-----|-----|-----|
| Azul-marinho | `#071B2C` | Primária, textos, headers |
| Azul oceano | `#123B56` | Secundária, gradientes |
| Branco | `#FFFFFF` | Fundos, textos sobre escuro |
| Cinza claro | `#F3F5F6` | Fundos de seções, cards |
| Dourado | `#C5A46D` | Acentos, CTAs premium, badges |

### Tipografia
- **Títulos:** Montserrat (400-800)
- **Textos:** Inter (300-700)

---

## Dados dos Produtos (Demo)

15 produtos demonstrativos organizados em 4 categorias:

| Categoria | Produtos | Destaques |
|-----------|----------|-----------|
| **Lanchas** | 3 | Premium 23ft, Esportiva 21ft, Cabinada 26ft |
| **Jet Skis** | 3 | Performance 180HP, Recreativo 130HP, Stand-Up Pro |
| **Buggys** | 2 | Duna 200cc, X-Terrain 400cc 4x4 |
| **Quadriciclos** | 3 | Trilha 450cc, Utilitário 500cc, Racing 700cc |

**Campos por produto:** id, slug, name, category, brand, model, year, price, available, featured, images[], thumbnail, model3d, description, shortDescription, specifications{}, features[], badges[], seo{}

> ⚠️ **Nota:** Todos os produtos são **DEMONSTRATIVOS**. Preços, especificações e disponibilidade devem ser confirmados pelos proprietários.

---

## Preparação para Fase 2 (Blender + 3D)

### Arquitetura Pronta
```
src/3d/Product3DViewer.jsx  - Componente principal
├── Product3DViewerPlaceholder  - Atual (imagens + navegação)
├── Product3DCanvas (template)  - Three.js/React Three Fiber
├── ProductModel (template)     - Carregamento .glb/.gltf
├── Loader3D (template)         - Loading state
└── viewer3DConfig (template)   - Configurações por categoria
```

### Estrutura de Pastas
```
public/models/                 # Pasta para modelos .glb/.gltf
├── lancha-23ft.glb
├── jetski-180.glb
├── buggy-200.glb
└── quad-450.glb
```

### Integração Futura
1. Substituir `Product3DViewerPlaceholder` por `Product3DCanvas`
2. Adicionar modelos `.glb` em `public/models/`
3. Atualizar `product.model3d` em `products.js` com caminho do modelo
4. Configurar `viewer3DConfig.cameraPresets` por categoria
5. Implementar HDRI environments para iluminação realística

### Recursos Planejados
- ✅ Rotação 360° (OrbitControls)
- ✅ Zoom (scroll/pinch)
- ✅ Pan (arrastar)
- ✅ Auto-rotate quando ocioso
- ✅ Contact shadows
- ✅ Environment lighting (studio/outdoor/water)
- ✅ Exploded view (componentes)
- ✅ Hotspots para detalhes
- ✅ AR/QR code para mobile

---

## Painel Administrativo (Preparação)

### Estrutura Prevista
```
src/admin/                     # Futura pasta
├── pages/
│   ├── Dashboard.jsx
│   ├── Products/
│   │   ├── List.jsx
│   │   ├── Create.jsx
│   │   └── Edit.jsx
│   ├── Categories.jsx
│   ├── Orders.jsx
│   └── Settings.jsx
├── components/
│   ├── ProductForm.jsx        # Formulário completo
│   ├── ImageUploader.jsx      # Upload múltiplo + drag-drop
│   ├── Model3DUploader.jsx    # Upload .glb/.gltf
│   └── SpecsEditor.jsx        # Editor de especificações
└── hooks/
    ├── useProducts.js
    └── useAuth.js
```

### Integração Backend (Futura)
- **Opção 1:** Firebase/Firestore (rápido, serverless)
- **Opção 2:** Supabase (PostgreSQL + Auth + Storage)
- **Opção 3:** API própria (Node/Express + Prisma + PostgreSQL)
- **Opção 4:** Strapi/Keystone (Headless CMS)

### Campos do Produto (Admin)
- Básicos: nome, categoria, marca, modelo, ano, preço, disponível, destaque
- Mídia: múltiplas imagens (drag-drop, reorder, delete), modelo 3D
- Técnicos: especificações (chave/valor dinâmico), características (lista)
- SEO: title, description, keywords
- Badges: tags personalizáveis

---

## Como Executar

### Desenvolvimento
```bash
cd D:\TRAMP\lancha-jet
npm run dev
# Acesse http://localhost:3000 (ou porta indicada)
```

### Build de Produção
```bash
npm run build
# Saída em ./dist/
```

### Preview do Build
```bash
npm run preview
# Acesse http://localhost:3000
```

### Lint/Format
```bash
npx oxlint        # Lint rápido
npx prettier --write .  # Formatação
```

---

## Próximos Passos (Dependem dos Proprietários)

### Imediato (Para Apresentação)
- [ ] Substituir imagens placeholder por fotos reais da Represa de Jaguara
- [ ] Substituir imagens placeholder por fotos reais dos produtos
- [ ] Confirmar número de WhatsApp oficial
- [ ] Confirmar endereço completo em Rifaina-SP
- [ ] Confirmar horários de funcionamento
- [ ] Fornecer logotipo vetorial (SVG) da empresa
- [ ] Definir cores exatas da marca (se diferentes da paleta proposta)

### Curto Prazo (Lançamento)
- [ ] Cadastrar produtos reais no `products.js` ou via painel admin
- [ ] Configurar domínio `lanchajetquadriciclo.com.br`
- [ ] Configurar HTTPS/SSL
- [ ] Google Analytics / Tag Manager
- [ ] Pixel Facebook/Instagram
- [ ] Formulário de contato → integração real (EmailJS, SendGrid, ou backend)

### Fase 2 - Experiência 3D (Blender)
- [ ] Fotografia 360° de cada produto real
- [ ] Modelagem no Blender baseada nas fotos
- [ ] Exportação `.glb` otimizada (< 5MB cada)
- [ ] Upload para `public/models/`
- [ ] Ativar `Product3DCanvas` no `Product3DViewer`
- [ ] Testes em mobile (performance, touch)
- [ ] Configurar HDRI para iluminação "água/represa"

### Fase 3 - Painel Admin + E-commerce
- [ ] Escolher backend (Firebase/Supabase/API própria)
- [ ] Implementar autenticação (proprietários)
- [ ] CRUD de produtos com upload de imagens/3D
- [ ] Gestão de leads/contatos
- [ ] Integração WhatsApp Business API
- [ ] Catálogo PDF automático
- [ ] Orçamentos online

---

## Checklist de Entrega

| Item | Status |
|------|--------|
| ✅ Estrutura de pastas profissional | Concluído |
| ✅ Design System (variáveis, global) | Concluído |
| ✅ Header + Footer + WhatsApp | Concluído |
| ✅ Home page completa | Concluído |
| ✅ Catálogo com filtros/busca/ordenacao | Concluído |
| ✅ Página de detalhes do produto | Concluído |
| ✅ ProductCard reutilizável (grid/lista) | Concluído |
| ✅ Product3DViewer (arquitetura Fase 2) | Concluído |
| ✅ 15 produtos demo com dados completos | Concluído |
| ✅ Imagens placeholder organizadas | Concluído |
| ✅ SEO (meta tags, OG, Twitter, sitemap) | Concluído |
| ✅ Build de produção funcional | Concluído |
| ✅ Dev server funcionando | Concluído |
| ✅ Responsivo (mobile, tablet, desktop) | Concluído |
| ✅ Acessibilidade (ARIA, focus, semântica) | Concluído |
| ✅ Animações suaves + reduced-motion | Concluído |
| ⏳ Fotos reais da Represa de Jaguara | Pendente (proprietários) |
| ⏳ Fotos reais dos produtos | Pendente (proprietários) |
| ⏳ Informações de contato oficiais | Pendente (proprietários) |
| ⏳ Logotipo vetorial | Pendente (proprietários) |
| ⏳ Modelos 3D Blender | Fase 2 |
| ⏳ Painel administrativo | Fase 3 |

---

## Contato para Dúvidas Técnicas

**Desenvolvido com:**
- React 19 + Vite 6
- CSS Custom Properties (sem frameworks CSS)
- Arquitetura modular e escalável
- Preparado para crescimento futuro

**Estrutura pronta para:**
- Integração 3D (Three.js/R3F)
- Painel administrativo
- E-commerce completo
- Multi-idioma (i18n)
- PWA (offline, install prompt)