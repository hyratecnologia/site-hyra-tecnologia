# Site — Hyra Tecnologia

Página inicial do site da Hyra Tecnologia (seções: início, o que resolvemos, a solução completa site + agenda + loja, portfólio, serviços, processo e contato).

## Versões

| Versão | Pasta | Link |
| --- | --- | --- |
| v1 — clara (com botão de tema escuro), exportada do design | raiz (`index.html`) | https://hyratecnologia.com/ |
| v2 — clara, foco no celular, HTML/CSS puro | `v2/` | https://hyratecnologia.com/v2/ |

## Arquivos da v1

- `index.html` — a página do site (layout, estilos e conteúdo).
- `Main.dc.html` — só leva o endereço antigo para o novo (links já compartilhados).
- `support.js`, `vendor/react*.js` — runtime que renderiza a página no navegador.
- `img/portfolio/` — prints dos sites no ar (pc e celular), usados no portfólio. Para atualizar, tirar novos prints
  em 1440x900 (pc) e 390x780 com tela 2x (celular).
- Tema: claro por padrão; o botão do topo troca para escuro e lembra a escolha (`localStorage` `hyra-tema`).
  As cores ficam em variáveis CSS no começo do `<style>` (`:root` e `:root[data-theme="light"]`).
- A solução de agendamento aparece SEM nome de produto (decisão de 27/10/2026). Os negócios do celular de
  exemplo (Studio Lumi, Barbearia Navalha etc.) são inventados.

## Sites do portfólio (`portfolio/`)

Seis sites completos, cada um numa pasta própria (HTML, CSS e JS puros), publicados em
https://hyratecnologia.com/portfolio/<pasta>/ e ligados aos cards do portfólio (capas `capa-pc.jpg` e `capa-cel.jpg` de cada pasta).

| Pasta | Negócio | Tipo |
| --- | --- | --- |
| `vibex/` | Vibex AudioCar, som automotivo (Aparecida de Goiânia) | Cliente real |
| `restaurante/` | Casa Brasa, restaurante com cardápio online (`cardapio.html`, dados em `js/cardapio-dados.js`) | Conceito |
| `oficina/` | Torque Oficina Mecânica (`servicos.html` com as fichas) | Conceito |
| `solar/` | Raiar Energia Solar, com simulador de economia | Conceito |
| `planejados/` | Veio Marcenaria, móveis planejados | Conceito |
| `contabilidade/` | Âncora Contabilidade, com comparador de regimes | Conceito |

- Os negócios "conceito" são fictícios (o rodapé de cada um avisa) e o WhatsApp deles é o da Hyra.
- Fotos e logos ainda são provisórios: cada pasta tem um `FOTOS.md` com a lista do que trocar.
- `_backup/v1/` guarda a primeira versão dos seis sites (o GitHub Pages não publica pastas com `_`).

## Como visualizar

Os scripts podem ser bloqueados ao abrir via `file://`. Sirva a pasta localmente:

```bash
python -m http.server 8000
```

e acesse <http://localhost:8000>.

## Pendências

- WhatsApp da v1: (62) 9920-8147, na constante `WHATSAPP` do script do `index.html` (um lugar só). A v2 ainda usa o número de exemplo em `v2/js/main.js` e no contato do `v2/index.html`.
- O preço ainda não foi definido: o site mostra "a partir de R$ XX/mês".
- Os links do portfólio usam os endereços provisórios do Cloud Run; trocar quando houver domínio.

## Editor visual

- `editor.html` abre o site dentro de um editor (clicar, arrastar, cores, espaços, tamanho, esconder, subir/descer seções, recados), separado por computador e celular. Não altera o `index.html`: salva `alteracoes-site-hyra.json` (em Downloads) para aplicar depois no código.
- Abrir: dois cliques em `EDITAR O SITE.bat` (precisa do Python; não funciona abrindo o arquivo direto).
