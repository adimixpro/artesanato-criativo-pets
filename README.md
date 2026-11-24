# Artesanato Criativo Pets

Quiz e página de oferta. É um site estático: não tem compilação, build nem dependências para instalar.

## Estrutura

- `index.html`: toda a estrutura (abertura, quiz, resultado e oferta)
- `css/style.css`: todo o visual e as animações
- `js/app.js`: a lógica do quiz, da revelação e da página de oferta
- `img/`: imagens do quiz (acessórios, estilos, estampas, apliques e resultados)
- `media/`: vídeos e fotos da página de oferta

## Como editar

- Textos da oferta: `index.html`
- Nomes das opções do quiz: objeto `N` no começo de `js/app.js`
- Caminhos do quiz (quais estampas e apliques cada estilo tem): lista `ACC` em `js/app.js`
- Link do checkout: constante `CHECKOUT_URL` em `js/app.js`

## Como ver no computador

Abra a pasta em um servidor local, por exemplo com a extensão Live Server do VS Code. Abrir o `index.html` direto também funciona.

## Como publicar na Vercel

Importe o repositório e publique sem configurar nada: Framework Preset "Other", sem comando de build e sem pasta de saída. O `index.html` precisa ficar na raiz do repositório.

## Para o desenvolvedor: o que falta antes de anunciar

### 1. Dados do rodapé e das páginas legais
Já preenchido: o e-mail de contato artesanatocriativopets@gmail.com está no rodapé, nos Termos e na Política de privacidade.

### 2. Checkout
Já está ligado: `CHECKOUT_URL` em `js/app.js` aponta para `https://pay.cakto.com.br/36ukvy6_557712`.
O clique leva junto a query string da página (`location.search`), para preservar UTMs e `fbclid` até a Cakto.

### 3. Meta Pixel (ID atual da conta: 1499928214617760) e Microsoft Clarity (projeto w2ljzt4rmw)
Ainda não estão no código. Sugestão de eventos, com os pontos de gancho em `js/app.js`:

| Momento | Evento | Onde colocar |
|---|---|---|
| Qualquer visita | `PageView` | snippet base do Pixel no `<head>` do `index.html` |
| Toque em "Criar o meu agora" | `trackCustom('InicioQuiz')` | handler do botão `#start` |
| Cada escolha confirmada | `trackCustom('PassoQuiz', {passo})` | função `choose()` / `goStep()` |
| Resultado revelado | `track('ViewContent', {page:'result'})` | função `reveal()` |
| Abertura da oferta | `trackCustom('VerOferta')` | handler do `#cta` / `setupOffer()` |
| Clique em comprar | `track('InitiateCheckout', {value:47, currency:'BRL'})` | handler dos botões `.offer .buy`, antes do redirecionamento |
| Compra | `Purchase` | pela integração de Pixel da própria Cakto |

Use sempre `window.fbq && fbq(...)` para não quebrar se o Pixel for bloqueado.
A `Política de privacidade` já cita o Meta Pixel e o Clarity.

### 4. Observações
- `vercel.json` define cache para `img/`, `media/`, `css/` e `js/`.
- O vídeo de carregamento (`media/loading-pets.mp4`) só é baixado a partir do passo 3 do quiz, de propósito, para não pesar na abertura.
- O código do cartão de compartilhamento (`buildCard`, `shareText`) está no `js/app.js`, mas desligado: o botão foi tirado do resultado de propósito.
- Respeita `prefers-reduced-motion`: com ele ligado, as animações são desativadas.
