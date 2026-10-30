# Veio Marcenaria · espaços de foto

Hoje o site mostra **desenhos técnicos gerados no próprio navegador** (perspectiva, elevação com cotas,
planta e detalhe) no lugar das fotos. Para trocar por foto real:

1. Salve a foto na pasta `fotos/` (crie a pasta) com o nome exato da tabela abaixo.
2. Abra `js/fotos-config.js` e coloque o nome na lista, por exemplo:
   `window.VEIO_FOTOS = ['hero-cozinha.jpg', 'casa-marista-1.jpg'];`
3. Pronto: onde o nome estiver listado, o site mostra a foto; os demais continuam com o desenho.

Recomendado: JPG ou WebP, lado maior de 1600 px, até 300 KB. Fotografe com luz do dia, câmera na
altura do peito, porta e gavetas fechadas (uma foto com uma gaveta aberta funciona bem como "detalhe").

## Abertura

| Arquivo | Onde aparece | O que mostrar | Proporção |
|---|---|---|---|
| `hero-cozinha.jpg` | Prancha da abertura (topo da página) | Cozinha da Casa Marista inteira, de frente, com a ilha em primeiro plano | 3:2 horizontal |

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
| `casa-marista` | Casa Marista | Cozinha com ilha |
| `apto-jardim-goias` | Apartamento Jardim Goiás | Cozinha corredor |
| `suite-setor-bueno` | Suíte Setor Bueno | Dormitório (guarda-roupa) |
| `quarto-alphaville` | Quarto do Theo | Dormitório infantil |
| `closet-aldeia` | Closet Aldeia do Vale | Closet aberto com ilha |
| `closet-setor-oeste` | Closet Setor Oeste | Closet |
| `office-setor-sul` | Escritório Setor Sul | Home office |
| `office-pedro-ludovico` | Estúdio Pedro Ludovico | Home office |
| `sala-jardim-america` | Living Jardim América | Painel ripado e rack |
| `living-park-lozandes` | Apartamento Park Lozandes | Painel e nichos |
| `lavabo-marista` | Banheiro Setor Marista | Gabinete suspenso |
| `banho-serrinha` | Suíte Serrinha | Gabinete de banheiro |
| `gourmet-jardins-monaco` | Varanda Jardins Mônaco | Área gourmet |
| `gourmet-jao` | Casa no Jaó | Área gourmet |

Exemplo: `casa-marista-1.jpg`, `casa-marista-2.jpg`, `casa-marista-3.jpg`, `casa-marista-4.jpg`.

Os textos, medidas, materiais e prazos de cada projeto ficam em `js/dados.js`. Ao trocar por obras
reais, ajuste também esses dados.

## O que continua como desenho (não precisa de foto)

- Prévia dos ambientes (FL. 03), mostruário "Monte seu acabamento" (FL. 05), corte do módulo e plano
  de corte (FL. 07) e croqui do mapa (FL. 13). São ilustrações técnicas de propósito.

## Logo

O logo atual (símbolo de veios + "Veio" em serifada) é provisório e está desenhado em SVG no
`index.html` (classe `marca-simb`) e em `favicon.svg`. Para trocar, substitua esses dois SVGs.
