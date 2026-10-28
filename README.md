# Site — Hyra Tecnologia

Página inicial do site da Hyra Tecnologia (seções: início, o que resolvemos, a solução completa site + agenda + loja, portfólio, serviços, processo e contato).

## Versões

| Versão | Pasta | Link |
| --- | --- | --- |
| v1 — escura (com botão de tema claro), exportada do design | raiz (`Main.dc.html`) | https://hyratecnologia.github.io/site-hyra-tecnologia/ |
| v2 — clara, foco no celular, HTML/CSS puro | `v2/` | https://hyratecnologia.github.io/site-hyra-tecnologia/v2/ |

## Arquivos da v1

- `Main.dc.html` — a página do site (layout, estilos e conteúdo).
- `index.html` — redireciona para `Main.dc.html`.
- `support.js`, `vendor/react*.js` — runtime que renderiza a página no navegador.
- `img/portfolio/` — prints dos sites no ar (pc e celular), usados no portfólio. Para atualizar, tirar novos prints
  em 1440x900 (pc) e 390x780 com tela 2x (celular).
- Tema: escuro por padrão; o botão do topo troca para claro e lembra a escolha (`localStorage` `hyra-tema`).
  As cores ficam em variáveis CSS no começo do `<style>` (`:root` e `:root[data-theme="light"]`).
- A solução de agendamento aparece SEM nome de produto (decisão de 27/10/2026). Os negócios do celular de
  exemplo (Studio Lumi, Barbearia Navalha etc.) são inventados.

## Como visualizar

Os scripts podem ser bloqueados ao abrir via `file://`. Sirva a pasta localmente:

```bash
python -m http.server 8000
```

e acesse <http://localhost:8000>.

## Pendências

- WhatsApp da v1: (62) 9920-8147, na constante `WHATSAPP` do script do `Main.dc.html` (um lugar só). A v2 ainda usa o número de exemplo em `v2/js/main.js` e no contato do `v2/index.html`.
- O preço ainda não foi definido: o site mostra "a partir de R$ XX/mês".
- Os links do portfólio usam os endereços provisórios do Cloud Run; trocar quando houver domínio.

## Editor visual

- `editor.html` abre o site dentro de um editor (clicar, arrastar, cores, espaços, tamanho, esconder, subir/descer seções, recados), separado por computador e celular. Não altera o `Main.dc.html`: salva `alteracoes-site-hyra.json` (em Downloads) para aplicar depois no código.
- Abrir: dois cliques em `EDITAR O SITE.bat` (precisa do Python; não funciona abrindo o arquivo direto).
