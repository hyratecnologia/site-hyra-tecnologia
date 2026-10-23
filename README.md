# Site — Hyra Tecnologia

Página inicial do site da Hyra Tecnologia (seções: início, soluções, portfólio, agenda e contato).

## Versões

| Versão | Pasta | Link |
| --- | --- | --- |
| v1 — escura, exportada do design | raiz (`Main.dc.html`) | https://hyratecnologia.github.io/site-hyra-tecnologia/ |
| v2 — clara, foco no celular, HTML/CSS puro | `v2/` | https://hyratecnologia.github.io/site-hyra-tecnologia/v2/ |

## Arquivos da v1

- `Main.dc.html` — a página do site (layout, estilos e conteúdo).
- `index.html` — redireciona para `Main.dc.html`.
- `support.js`, `vendor/react*.js` — runtime que renderiza a página no navegador.

## Como visualizar

Os scripts podem ser bloqueados ao abrir via `file://`. Sirva a pasta localmente:

```bash
python -m http.server 8000
```

e acesse <http://localhost:8000>.

## Pendências

- Trocar o número de WhatsApp de exemplo (`55XXXXXXXXXXX`) pelo número real. Na v2: `v2/js/main.js` (constante `WHATSAPP`) e o link na seção de contato do `v2/index.html`.
- Preencher e-mail e o valor mensal do Hyra Agenda (`[SEU E-MAIL]`, `[VALOR]`).
