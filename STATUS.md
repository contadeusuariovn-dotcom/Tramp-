# STATUS - Lancha Jet Quadriciclo

## Data: 11/11/2026 (sessão 3 — Modelos 3D + Vistoria mobile)

### FASE 3D CONCLUÍDA — modelos 3D para TODOS os 29 produtos

**Pipeline**: gerador paramétrico headless no Blender 5.0 (`tools/blender/boatforge.py`) —
3 arquétipos (jetski / lancha open / cabinada) parametrizados por produto (comprimento,
cores do casco/acento, motor de popa vs. sterndrive, torre de wake). **Não é fotoreal**:
é uma visualização estilizada e coerente para o cliente girar/zoom e ver cores/forma.

- `boatforge.py`: CONFIG com os 29 slugs (mesma ordem do products.js), modos
  `preview|export|all` via `blender.exe --background --factory-startup --python boatforge.py -- <modo> <outdir> [slug|ALL]`
- Export normalizado: modelo centrado em X/Y e assentado em z=0 (enquadramento previsível no viewer)
- 29 GLBs em `public/models/` (204–301 KB cada, bem abaixo do alvo de ~2 MB)
- Validação visual: cada arquétipo inspecionado em 2 ângulos (`previews/*.png` e `*-top.png`)

**Bugs de geometria corrigidos durante a iteração** (registrar: todos os renders "flutuando"
tinham UMA causa): `rounded_box` escalava por `size/2` → **todos os boxes nasciam com metade
do tamanho** (bancos flutuando, cabine miúda, motor de popa minúsculo). Correção de uma linha
(`ob.scale = size`) consertou em cascata. Também: `matrix_world` stale (chamar
`bpy.context.view_layer.update()` antes de medir bbox), câmera invertida (`center - campos`),
RGBA com 5 itens, `rc` função vs. valor, faixa da borda duplicada, banco do jetski
re-empilhado por referência explícita, cabine realocada para o terço dianteiro (a caixa
antiga "flutuava" sobre a proa), motor de popa reproporcionado (carenagem+haste+turbina+skeg+hélice).

### Viewer 3D (`src/3d/Product3DViewer.jsx`) — implementado de verdade

- react-three-fiber + drei (`useGLTF`, `OrbitControls`, `ContactShadows`, `useProgress`)
- **Sem `Environment preset`** (dependeria de CDN) — luzes próprias (ambient/hemi/2 directional)
- Auto-enquadramento por `Box3` (câmera alvo no centro, distância 2,1×maxDim), auto-rotação 0,9
- Toggle **3D ↔ Fotos** na toolbar (3D é o modo padrão quando o produto tem modelo)
- Loading overlay com % (`useProgress`); erro de carga → `ModelErrorBoundary` → volta
  automaticamente pra galeria de fotos (esconde o botão 3D)
- `useGLTF.preload` no mount; fullscreen mantido; `ContactShadows` com `frames={1}` (cena estática)
- Lint limpo: mutação de câmera isolada em helper `frameCamera(cam, ctl, ...)` (parâmetros
  não acionam a regra de imutabilidade do oxlint)

### VISTORIA MOBILE (relato do colega: sem seta pra voltar; imagens/textos bugam ao deslizar)

1. **Seta de voltar (bug #1)** — `Header.jsx` ganhou botão circular `header__back`
   (ArrowLeft) em TODAS as páginas internas (produto → /catalogo, catálogo → /);
   escondido no desktop ≥1024px. Também corrigido telefone placeholder
   "(16) 99999-9999" → **(16) 99401-3303** no menu mobile.
2. **Imagens/textos bugam ao deslizar (bug #2)** — causas encontradas e corrigidas:
   - Setas de trocar foto do Produto ficavam `opacity: 0` até `:hover` — **em touch
     nunca apareciam** (agora visíveis com `@media (hover: none)`)
   - **Swipe de verdade** nas fotos (ProductDetail principal + modal, e galeria do
     viewer 3D): deltaX ≥48px troca de imagem (`touch-action: pan-y` preserva o scroll
     vertical; sem "borrachão" lateral)
   - `img { -webkit-user-drag: none; user-select: none }` + `-webkit-tap-highlight-color:
     transparent` no global.css (imagens não "grudam" no dedo, sem flash azul de tap)
   - Hero 100vh → **100svh** (Home) e hero do catálogo 400px inline fixo → CSS responsivo
     (34svh no mobile) — o salto/estouro da barra de URL do iOS desaparece
   - Galeria sticky desativada no mobile (empilha antes das infos); modal de imagem
     `80dvh` + botão fechar com `safe-area-inset-top`
   - Botão morto "Ver em 3D (Fase 2)" do ProductDetail removido (o toggle real está
     dentro do viewer)
3. `products.js`: 29 × `model3d` preenchidos pós-array (`'/models/' + p.slug + '.glb'`)
   — verificado: 29/29 com arquivo existente em `public/models/`, paths únicos.

### Validação desta sessão

- ✅ `npm run build` (vite/rolldown, ~6s, sem erros)
- ✅ `npm run lint` (oxlint, ZERO warnings)
- ✅ `node import`: 29 produtos, 29 model3d, paths únicos, 29/29 GLBs existentes
- ✅ 3 arquétipos renderizados em 2 ângulos e inspecionados visualmente

### Pendente / requer ação do usuário

1. **Validação visual (Ctrl+F5 em http://localhost:3000)**: abrir um produto →
   ver o 3D girando, testar o botão "Fotos"/"3D", testar no celular (seta de voltar
   no topo, swipe nas fotos, sem layout pulando).
2. **Quadriciclos/buggys**: quando o usuário fornecer fotos/dados reais, re-adicionar os
   produtos em `products.js` (e novos GLBs no boatforge.py, se quiser 3D também).
3. **Opcional**: publicar via GitHub Pages (base `/Tramp-/`) — oferta feita, sem resposta.
4. **Opcional**: iterar visual dos 3D (mais detalhes por modelo específico).

### Próxima etapa

Commit + push (git do GitHub Desktop), validação do usuário no navegador/celular.

---

## Sessões anteriores

### Sessão 2 (11/11) — catálogo real

### Decisão principal: catálogo SOMENTE com produtos reais

A pedido do usuário, o site agora exibe **apenas os produtos com fotos reais da empresa**
(10 jet skis + 19 lanchas = **29 produtos**). Os 5 demos de quad/buggy foram REMOVIDOS do
catálogo; as categorias continuam no site (cards da Home + filtros) com aviso "Em breve —
sob consulta", aguardando fotos reais da loja.

### Catálogo em `src/data/products.js` (29 produtos)

- **10 jet skis Sea-Doo** (R$62.000–169.900): Explorer Pro 230, GTX 170 (2025 e 2022),
  GTX 230, Wake Pro 230, RXT-X 325, GTX Limited 325, GTX 325 Limited, GTI 90, Wake 155
- **19 lanchas** (R$80.000–400.000): Mestra 19.8 (2 fotos, R$110.000), Mestra 230,
  Ventura 175/190/195 (2012, 2013 e Crossover 2022)/210/210 Comfort/215/250 Comfort/1992,
  Triton 240 Open Sport, Focker 222/230 Cabinada/230 Black/255 GTO, FS 230 Scappare/275 Wide
- **Destaques (featured, 6)**: RXT-X 325, GTX 325 Limited, Triton 240, Focker 255 GTO,
  Ventura 250 Comfort, FS 275 Wide
- Exports: `export const products` (NAMED — exigido pelo `Catalog.jsx`) + `export default`

### Incidente e recuperação (importante registrar)

O script de truncagem que removeria os demos casou a palavra `BUGGYS` no **cabeçalho do
arquivo** (linha 5) em vez do marcador da seção, cortando `products.js` para 4 linhas.
**Recuperação**: o build anterior (`dist/assets/index-*.js`, 08:34) continha os 34 produtos
compilados; um script Node (`extract-products.mjs`) extraiu o array do bundle, filtrou os
29 reais e regerou o arquivo no estilo original (2 espaços, aspas simples). Acentos verificados
com grep/read (o console do PowerShell corrompe a EXIBIÇÃO de UTF-8 — os arquivos estavam íntegros).
**Lição: nunca truncar por âncora ambígua — reescrever o arquivo inteiro; named export
`products` é obrigatório para o Catalog.**

### UI ajustada nesta sessão

1. **Seção Rifaina ilegível (corrigida)** — causa raiz: `src/index.css` era o template do Vite
   (`:root { background: #fff }` pintava por cima dos fundos `z-index: -1`) e `#root`
   engessado (1126px, `text-align: center`). Arquivo esvaziado de propósito; estrutura do
   `#root` movida ao `global.css`. Seção Rifaina agora usa `isolation: isolate` + z-index 0/1.
2. **Fundo fotográfico (Usina de Jaguara) em todas as seções**: Categorias, Destaques,
   Sobre, Contato (Home) e CTA do Catálogo — padrão `isolation: isolate` + `::before`
   (imagem) e `::after` (véu) em `z-index: -1`. Destaques com `section-header--light` + botão gold.
3. **Links de categoria no menu funcionando** — `Catalog.jsx` sincroniza `?category=` da URL
   via useEffect (`/* oxlint-disable set-state-in-effect */`).
4. **Cards de categoria (Home)**: count 0 → "Em breve — sob consulta" (em vez de
   "0 modelos disponíveis").
5. **Catálogo**: badge de contagem ocultado quando 0 (botões de categoria e `<option>` do
   select mobile); estado vazio com texto amigável + botão "Falar no WhatsApp"
   (`.catalog__empty-actions`, usa `siteConfig.contact.whatsapp`).
6. **Footer**: removida a frase "Este site apresenta produtos demonstrativos." do disclaimer.
7. **Toolbar de filtros sticky** funcionando (`body { overflow-x: clip }`, não `hidden`).

### Imagens

- `public/images/products/`: somente fotos reais da empresa (30) + placeholder.
  As 8 fotos livres de quad/buggy (`quad-450-1/2`, `quad-500-1`, `quad-700-1`,
  `buggy-200-1/2`, `buggy-400-1/2`) movidas para `backup-images-originais/`.
- `public/images/categories/`: mantidas `quadriciclos.jpg` e `buggys.jpg` (cards da Home).
- Verificação: 48 referências `/images/` no src — **zero faltando, zero órfãs**
  (as 2 sinalizadas como órfãs eram falsos positivos: usadas em JSX com aspas duplas).

### Validação

- ✅ `npm run build` (vite 8.3.7, ~3.2s, sem erros)
- ✅ `npm run lint` (oxlint, sem erros)
- ✅ `node import` do products.js: 29 produtos, contagens 19/10/0/0

### Sessão anterior (11/11 manhã) — já concluído

- Fotos reais da empresa (30 stories do Instagram) em `public/images/products/`
- Diagnóstico: imagens antigas eram genéricas do Unsplash (código nunca esteve errado)

### Pendente / requer ação do usuário

1. **Validação visual** (Ctrl+F5 em http://localhost:3000): Home (fundos fotográficos,
   "Em breve" nas categorias sem produto), catálogo (29 produtos, filtro por categoria,
   WhatsApp no estado vazio), páginas de detalhe dos 29 produtos.
2. **Quadriciclos/buggys**: quando o usuário fornecer fotos/dados reais, re-adicionar os
   produtos em `products.js` (as categorias já estão prontas no site).
3. **Opcional**: avaliar `object-fit: contain` na galeria do ProductDetail (artes verticais
   1080x1920 cortam via cover).

### Próxima etapa

Usuário valida no navegador; envio das fotos reais de quads/buggys para re-montar essas
categorias com produtos reais.
