# Casa Brasa: espaços de foto

Enquanto as fotos não chegam, cada espaço mostra um desenho em traço no estilo do site.
Salve as fotos na pasta `img/` com o nome indicado.

## Página inicial (index.html)

Cada espaço é um `<figure class="foto" data-foto="...">`. Para trocar, apague o `<svg>` de dentro
do `<div class="foto-quadro">` e coloque no lugar:
`<img src="img/NOME.jpg" alt="descrição da foto">`. A legenda (figcaption) pode continuar.

| Arquivo | Onde aparece | O que mostrar | Proporção |
|---|---|---|---|
| `img/abertura-costela-fogo-de-chao.jpg` | Abertura (Foto 01) | Ripa de costela presa na estaca ao lado do fogo de chão, com fumaça, luz natural da tarde | 4:5 vertical (ex.: 1200x1500) |
| `img/casa-salao-balcao-do-fogo.jpg` | A casa (Foto 02) | Salão visto do balcão: bancos altos, luminárias, fogo atrás do vidro, de noite | 3:2 horizontal (1500x1000) |
| `img/destaque-costela-de-chao.jpg` | Da brasa (Foto 03) | Costela de chão desfiando na tábua, com mandioca e vinagrete, vista de cima ou a 45° | 5:4 (1500x1200) |
| `img/insta-1-picanha-tabua.jpg` | Faixa do Instagram (04) | Picanha fatiada na tábua, na mesa | 1:1 (1080x1080) |
| `img/insta-2-pequi-feira.jpg` | Faixa do Instagram (05) | Pequi chegando da feira, em caixa ou cesto | 1:1 |
| `img/insta-3-pequi-tonic.jpg` | Faixa do Instagram (06) | Drink pequi tonic no balcão | 1:1 |
| `img/insta-4-pamonha-brulee.jpg` | Faixa do Instagram (07) | Pamonha brûlée sendo queimada no maçarico | 1:1 |

## Cardápio (cardapio.html)

As fotos dos pratos entram pelo arquivo `js/cardapio-dados.js`: em cada prato, adicione o campo
`foto: "img/pratos/NOME.jpg"`. A foto aparece na miniatura da lista (quadrada, 76 px) e no topo do
detalhe do prato (16:10). Recomendado: 1200x750, prato centralizado, fundo de madeira ou papel.

Sugestão de prioridade (os mais pedidos): picanha da casa, costela de chão 12 horas, pintado na folha
de bananeira, provoleta com mel e baru, couve-flor inteira na brasa, arroz de pequi, pamonha brûlée,
caipirinha de cagaita e pequi tonic. Os demais podem continuar com o desenho.

## Imagem de compartilhamento

`capa-pc.jpg` (1366x800) é usada no Open Graph da página inicial e `capa-cel.jpg` no cardápio.
Depois das fotos reais, gere novas capas ou troque por uma foto 1200x630.
