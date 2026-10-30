# Casa Brasa: espaços de foto

Enquanto as fotos não chegam, cada espaço mostra uma composição colorida (prato visto de cima,
cena do fogo, salão) desenhada em `img/casa.svg`, sobre um fundo na cor da marca.
Salve as fotos na pasta `img/` com o nome indicado.

## Como trocar (página inicial)

Cada espaço é um `<figure class="foto ..." data-foto="img/NOME.jpg">` com um `<svg>` dentro.
Apague o `<svg>` e coloque no lugar:
`<img src="img/NOME.jpg" alt="descrição da foto">`
A foto preenche o quadro sozinha (`object-fit: cover`). A cor de fundo pode ficar: aparece só enquanto a foto carrega.

Dica de direção de fotografia: luz quente e direta, fundo escuro ou de madeira, comida perto da câmera,
com fumaça e brasa aparecendo quando fizer sentido. Fotos vivas e saturadas combinam com a paleta.

| Arquivo | Onde aparece | O que mostrar | Proporção |
|---|---|---|---|
| `img/abertura-costela-fogo-de-chao.jpg` | Abertura (lado direito no computador, abaixo do título no celular) | Ripa de costela presa na estaca ao lado do fogo de chão, chama viva e fumaça | 4:5 vertical (1200x1500). No computador o quadro é recortado: deixe o assunto no centro |
| `img/destaque-costela-de-chao.jpg` | "O que faz fila no sábado", foto grande | Costela de chão desfiando na tábua, mandioca e vinagrete, vista de cima | 1:1 (1400x1400) |
| `img/destaque-picanha-da-casa.jpg` | "O que faz fila no sábado", à direita | Picanha fatiada na tábua com chimichurri e farofa | 16:10 (1600x1000) |
| `img/destaque-pintado-bananeira.jpg` | "O que faz fila no sábado", à direita | Pintado aberto na folha de bananeira com limão | 16:10 (1600x1000) |
| `img/casa-salao-balcao-do-fogo.jpg` | A casa | Salão visto do balcão: bancos altos, luminárias e o fogo atrás do vidro, à noite | 3:2 (1500x1000) |
| `img/executivo-prato-do-dia.jpg` | Cartão do almoço executivo | Prato executivo montado (arroz, feijão, carne, salada), de cima | 16:10 (1200x750) |
| `img/espaco-varanda-pequizeiro.jpg` | O espaço | Varanda à noite com mesas ao redor do pequizeiro e luzes penduradas | 3:2 (1500x1000) |
| `img/visita-fachada-portao.jpg` | Horários e endereço | Fachada com o portão de madeira e a lanterna acesa, fim de tarde | 4:5 (1200x1500) |
| `img/insta-1-picanha-tabua.jpg` | Faixa do Instagram (1) | Picanha fatiada na mesa | 1:1 (1080x1080) |
| `img/insta-2-pequi-cesto.jpg` | Faixa do Instagram (2) | Cesto de pequi, alguns abertos mostrando a polpa amarela | 1:1 |
| `img/insta-3-pequi-tonic.jpg` | Faixa do Instagram (3) | Pequi tonic e caipirinha no balcão | 1:1 |
| `img/insta-4-pamonha-brulee.jpg` | Faixa do Instagram (4) | Pamonha brûlée com a casquinha queimada | 1:1 |

## Cardápio (cardapio.html)

As fotos dos pratos entram pelo arquivo `js/cardapio-dados.js`: em cada prato, adicione o campo
`foto: "img/pratos/NOME.jpg"`. A foto substitui a composição na miniatura da lista (quadrada, 88 a 104 px,
cantos arredondados) e no topo do detalhe do prato (16:10).
Recomendado: 1200x750, prato centralizado e bem perto, para continuar legível na miniatura pequena.
Comprima para menos de 150 KB cada (quem lê o QR na mesa está no 4G).

Prioridade (os mais pedidos): picanha da casa, costela de chão 12 horas, pintado na folha de bananeira,
provoleta com mel e baru, couve-flor inteira na brasa, arroz de pequi, pamonha brûlée, caipirinha de
cagaita e pequi tonic. Os demais podem continuar com a composição colorida.

## Imagem de compartilhamento

`capa-pc.jpg` (1366x800) é usada no Open Graph da página inicial e `capa-cel.jpg` (390x844) no cardápio.
Depois das fotos reais, gere novas capas ou troque por uma foto 1200x630.
