# Veio Marcenaria · espaços de foto

Hoje o site mostra **desenhos técnicos gerados no próprio navegador** (perspectiva, elevação com cotas,
planta e detalhe) no lugar das fotos. Para trocar por foto real:

1. Salve a foto na pasta `fotos/` (crie a pasta) com o nome exato da tabela abaixo.
2. Abra `js/fotos-config.js` e coloque o nome na lista, por exemplo:
   `window.VEIO_FOTOS = ['hero-cozinha.jpg', 'casa-salvia-1.jpg'];`
3. Pronto: onde o nome estiver listado, o site mostra a foto; os demais continuam com o desenho.

Recomendado: JPG ou WebP, lado maior de 1600 px, até 300 KB. Fotografe com luz do dia, câmera na
altura do peito, porta e gavetas fechadas (uma foto com uma gaveta aberta funciona bem como "detalhe").

## Abertura

| Arquivo | Onde aparece | O que mostrar | Proporção |
|---|---|---|---|
| `hero-cozinha.jpg` | Prancha da abertura (topo da página) | Cozinha da Casa Sálvia inteira, de frente, com a ilha em primeiro plano | 3:2 horizontal |

## Projetos (pasta FL. 04)

Cada projeto tem 4 imagens. A `-1` também é a capa do card na grade.

| Sufixo | O que mostrar | Proporção |
|---|---|---|
| `-1.jpg` | Ambiente inteiro, foto principal (vai no card e abre a galeria) | 3:2 horizontal |
| `-2.jpg` | Móvel de frente, parede inteira, sem perspectiva forte (substitui a elevação) | 3:2 horizontal |
| `-3.jpg` | Planta ou render 3D aprovado pelo cliente, ou uma segunda foto do ambiente | 3:2 horizontal |
| `-4.jpg` | Detalhe: canto de porta, puxador, gaveta aberta mostrando corrediça | 3:2 horizontal |

| Prefixo do arquivo | Projeto | Ambiente |
|---|---|---|
| `casa-salvia` | Casa Sálvia | Cozinha com ilha |
| `apto-duplex` | Apartamento Duplex | Cozinha corredor |
| `suite-casal` | Suíte do Casal | Dormitório (guarda-roupa) |
| `quarto-theo` | Quarto do Theo | Dormitório infantil |
| `closet-aberto` | Closet Aberto | Closet aberto com ilha |
| `closet-hospedes` | Closet de Hóspedes | Closet |
| `office-juridico` | Escritório Jurídico | Home office |
| `office-estudio` | Estúdio do Arquiteto | Home office |
| `sala-ripado` | Living Ripado | Painel ripado e rack |
| `living-nichos` | Living Nichos Pretos | Painel e nichos |
| `lavabo-freijo` | Banheiro Freijó | Gabinete suspenso |
| `banho-salvia` | Suíte Sálvia | Gabinete de banheiro |
| `gourmet-varanda` | Varanda Gourmet | Área gourmet |
| `gourmet-piscina` | Casa da Piscina | Área gourmet |

Exemplo: `casa-salvia-1.jpg`, `casa-salvia-2.jpg`, `casa-salvia-3.jpg`, `casa-salvia-4.jpg`.

Os textos, medidas, materiais e prazos de cada projeto ficam em `js/dados.js`. Ao trocar por obras
reais, ajuste também esses dados.

## O que continua como desenho (não precisa de foto)

- Prévia dos ambientes (FL. 03), mostruário "Monte seu acabamento" (FL. 05), corte do módulo e plano
  de corte (FL. 07) e croqui do mapa (FL. 13). São ilustrações técnicas de propósito.

## Logo

O logo atual (símbolo de veios + "Veio" em serifada) é provisório e está desenhado em SVG no
`index.html` (classe `marca-simb`) e em `favicon.svg`. Para trocar, substitua esses dois SVGs.
