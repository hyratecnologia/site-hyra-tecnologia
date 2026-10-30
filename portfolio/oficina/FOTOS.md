# Espaços de foto · Torque Oficina Mecânica

Hoje cada espaço mostra uma cena ilustrada em SVG nas cores da marca (grafite, vermelho #D9310B,
amarelo de demarcação #FFC21A). Para trocar por foto real: salve o arquivo em `img/` e, dentro do
`<figure>` que tem o `data-foto` correspondente em `index.html`, substitua o `<svg class="foto__art">`
por `<img src="img/NOME.jpg" alt="descrição" loading="lazy">` (no hero, sem `loading="lazy"`).
A legenda (`figcaption class="foto__cap"`) pode ficar.

Direção das fotos: oficina limpa e bem iluminada (luz de LED branca), com a cor da marca aparecendo
(coluna de elevador, faixa da parede, gaveteiro ou uniforme vermelhos; faixa amarela no piso).
Nada de foto cinza e apagada: contraste e cor viva, tratamento levemente mais quente e saturado.

| Arquivo | Onde aparece | O que mostrar | Proporção |
|---|---|---|---|
| `hero-box.jpg` | Topo da página, ao lado do título | Carro erguido no elevador de um box, foto de lado, piso limpo com a faixa amarela, luz de LED no teto e algo vermelho da marca ao fundo | 5:4 no desktop / 4:3 no celular (ex.: 1600×1280, assunto no centro) |
| `oficina-boxes.jpg` | "A oficina por dentro", foto grande | Visão geral dos boxes 1 e 2 com elevadores e carros, de preferência com mecânico trabalhando | 16:10 (ex.: 1800×1125) |
| `scanner.jpg` | "A oficina por dentro", 2ª foto | Tablet/scanner conectado ao carro mostrando gráfico ou leitura ao vivo | 4:3 (ex.: 1200×900) |
| `alinhador-3d.jpg` | "A oficina por dentro", 3ª foto | Roda com os alvos do alinhador 3D presos, câmeras ao fundo | 4:3 (ex.: 1200×900) |
| `recepcao.jpg` | "A oficina por dentro", 4ª foto | Balcão de atendimento com o quadro de chaves e o vidro da área de espera para os boxes | 4:3 (ex.: 1200×900) |
| `fachada.jpg` | "A oficina por dentro", 5ª foto | Fachada de dia, portão grafite e placa TORQUE vermelha | 4:3 (ex.: 1200×900) |

Observações
- Fotos próprias da oficina (nada de banco de imagens). Celular bom, na horizontal, com luz do dia, já resolve.
- Exportar em JPG qualidade ~80, até 300 KB cada (hero até 400 KB).
- O desenho do carro usado nas cenas fica num sprite oculto no começo do `<body>` (`<symbol id="carro">`).
  Se todas as cenas forem trocadas por foto, esse sprite pode ser apagado.
- Logo: provisório (porca sextavada branca num bloco vermelho com canto chanfrado), em SVG no
  `index.html`, `servicos.html` e `favicon.svg`.
- `servicos.html` é gerado pelo script `gera_servicos.py` (pasta de teste do coordenador) a partir do
  cabeçalho e rodapé do `index.html`. Se mudar cabeçalho/rodapé, rode o script de novo ou edite os dois.
