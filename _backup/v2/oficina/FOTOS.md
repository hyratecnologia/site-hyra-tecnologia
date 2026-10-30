# Espaços de foto · Torque Oficina Mecânica

Hoje cada espaço mostra um desenho técnico em traço (SVG) no estilo "prancha" do site.
Para trocar por foto real: salve o arquivo em `img/` e, dentro do `<figure>` que tem o
`data-foto` correspondente, substitua o `<svg class="foto__art">` (ou `<svg class="prancha__draw">`)
por `<img src="img/NOME.jpg" alt="descrição" loading="lazy">`. A legenda (`figcaption`) pode ficar.

| Arquivo | Onde aparece | O que mostrar | Proporção |
|---|---|---|---|
| `hero-box.jpg` | Topo da página (prancha escura atrás da ordem de serviço), `index.html` | Carro no elevador, foto de lado, box limpo e bem iluminado. Deixe o lado direito/inferior mais "calmo", porque a OS fica por cima | 16:11 (ex.: 1600×1100) |
| `oficina-boxes.jpg` | Folha 08 "A oficina por dentro", foto grande | Visão geral dos boxes 1 e 2 com elevadores e carros, de preferência com mecânico trabalhando | 16:10 (ex.: 1800×1125) |
| `scanner.jpg` | Folha 08, segunda foto | Tablet/scanner conectado ao carro mostrando gráfico ou leitura ao vivo | 4:3 (ex.: 1200×900) |
| `alinhador-3d.jpg` | Folha 08, terceira foto (vertical no desktop) | Roda com os alvos do alinhador 3D presos, câmeras ao fundo | 3:4 no desktop / 4:3 no celular (ex.: 1200×1200, com o assunto no centro) |
| `recepcao.jpg` | Folha 08, quarta foto | Balcão de atendimento com o quadro de chaves e a área de espera com vidro para os boxes | 4:3 (ex.: 1200×900) |
| `fachada.jpg` | Folha 08, quinta foto | Fachada com o portão grafite e a placa TORQUE, de dia | 4:3 (ex.: 1200×900) |

Observações
- Fotos próprias da oficina (nada de banco de imagens). Celular bom, na horizontal, com luz do dia, já resolve.
- Exportar em JPG qualidade ~80, até 300 KB cada.
- Logo: o atual é provisório (porca sextavada com seta de torque, em SVG no `index.html`, `servicos.html` e `favicon.svg`).
