# Site — Hyra Tecnologia

Página inicial do site da Hyra Tecnologia (seções: início, soluções, a solução completa site + agenda + loja, para quem, portfólio, processo e contato).

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

- Trocar o número de WhatsApp de exemplo (`55XXXXXXXXXXX`) pelo número real. Na v2: `v2/js/main.js` (constante `WHATSAPP`) e o link na seção de contato do `v2/index.html`.
- Preencher o e-mail (`[SEU E-MAIL]`). O preço mostrado é "a partir de R$ 89/mês" (plano Essencial).
- Os links do portfólio usam os endereços provisórios do Cloud Run; trocar quando houver domínio.
