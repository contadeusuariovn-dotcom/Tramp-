# STATUS - Lancha Jet Quadriciclo

## Data: 11/11/2026 (sessão 2)

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
