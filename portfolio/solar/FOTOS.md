# Espaços de foto · Raiar Energia Solar

Hoje cada espaço mostra uma cena colorida em SVG (céu de amanhecer, verde, módulos em verde-noite) na paleta do site.
Para trocar por foto: coloque o arquivo em `img/` e, dentro do `<figure class="foto" data-foto="...">`, troque o
`<svg>...</svg>` por `<img src="img/NOME.jpg" alt="descrição" loading="lazy" width="1200" height="900">`.
O CSS já recorta no formato certo (`object-fit: cover`). Mantenha a `<figcaption>`, ajustando o texto.

| Arquivo | Onde aparece | O que mostrar | Proporção |
|---|---|---|---|
| `usina-amanhecer.jpg` | Faixa larga entre "Lei 14.300" e "Como funciona" (`.panorama`) | Fileiras de módulos em solo com o sol nascendo ou se pondo; céu laranja/dourado, mato verde. A legenda fica num bloco escuro no canto inferior esquerdo, então deixe o assunto principal à direita | 21:8 panorâmica (mín. 2400×900) |
| `equipe-instalacao.jpg` | "34 dias entre assinar e ver o primeiro kWh", abaixo do texto | Equipe própria no telhado fixando módulos, com EPI (capacete, linha de vida); de preferência céu limpo | 4:3 (mín. 1200×900) |
| `obra-fazenda-irrigacao.jpg` | Obras, destaque grande | Usina em solo numa fazenda, com a casa de bombas ou o pivô ao fundo; luz de fim de tarde | 4:3 (mín. 1600×1200) |
| `obra-sobrado.jpg` | Obras, card 2 | Sobrado com módulos no telhado, foto de cima ou de drone | 16:10 (mín. 1200×750) |
| `obra-clinica.jpg` | Obras, card 3 | Laje ou cobertura comercial com módulos em estrutura inclinada | 16:10 (mín. 1200×750) |

Observações
- A cena do topo (casa com o sol percorrendo o céu e a curva de geração) NÃO é espaço de foto: é uma animação ligada aos números ao lado. Fica como está.
- Use fotos de obras próprias (nada de banco de imagens). Prefira fotos com cor: céu azul forte deve ser evitado ou recortado (a marca não usa azul); amanhecer, pôr do sol e verde funcionam melhor.
- O logotipo é provisório (SVG no próprio HTML: cabeçalho e rodapé, mais `favicon.svg`). Se houver logo oficial, trocar nesses três lugares.
- `capa-pc.jpg` e `capa-cel.jpg` são as capturas para o card do portfólio.
