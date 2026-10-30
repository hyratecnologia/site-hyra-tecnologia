# Espaços de foto · Raiar Energia Solar

Hoje cada espaço mostra uma cena desenhada em traço (SVG) no estilo do site. Para trocar por foto:
coloque o arquivo em `img/` e, dentro do `<figure class="foto" data-foto="...">`, troque o `<svg>...</svg>`
por `<img src="img/NOME.jpg" alt="descrição" loading="lazy" width="1200" height="900">`
(o CSS já recorta no formato certo). Mantenha a `<figcaption>`, ajustando o texto.

| Arquivo | Onde aparece | O que mostrar | Proporção |
|---|---|---|---|
| `obra-fazenda-rio-verde.jpg` | Obras (FL. 06), card grande | Usina em solo numa fazenda, de preferência com a casa de bombas ou o pivô ao fundo; luz de fim de tarde | 4:3 (mín. 1200×900) |
| `obra-jardim-goias.jpg` | Obras, card 2 | Telhado de casa/sobrado com módulos, foto de cima ou de drone | 16:9 no celular, recorte vertical no desktop (envie 1200×900) |
| `obra-clinica-setor-bueno.jpg` | Obras, card 3 | Laje ou cobertura comercial com módulos em estrutura inclinada | idem acima |

Observações
- Use fotos de obras próprias (nada de banco de imagens). Evite céu estourado: o site é claro e a foto deve ter contraste.
- O logotipo é provisório (SVG no próprio HTML: cabeçalho, rodapé e `favicon.svg`). Se houver logo oficial, trocar nesses três lugares.
- `capa-pc.jpg` e `capa-cel.jpg` são as capturas para o card do portfólio.
