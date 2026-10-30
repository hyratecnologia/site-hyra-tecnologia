# Vibex AudioCar · fotos a enviar

Os espaços de foto estão desenhados em traço (estilo prancha técnica) e marcados como "Exemplo".
Para trocar: coloque a foto em `img/` e, dentro do `<figure class="foto" data-foto="...">`, substitua o `<svg>` por
`<img src="img/NOME.jpg" alt="descrição" loading="lazy">`. Depois atualize a ficha (carro, o que entrou, objetivo) e
apague o selo "Exemplo".

| Arquivo | Onde aparece | O que a foto deve mostrar | Proporção |
|---|---|---|---|
| `projeto-01-trio.jpg` | Folha 06 · Projetos, ficha grande P-01 | Porta-malas aberto com a caixa trio instalada, acabamento do carpete visível | 4:3 (fica alta no desktop: prefira foto vertical ou quadrada com o assunto no centro) |
| `projeto-02-portas.jpg` | Folha 06 · ficha P-02 | Forro da porta aberto com o falante novo no anel de MDF | 4:3 |
| `projeto-03-multimidia.jpg` | Folha 06 · ficha P-03 | Painel com a multimídia ligada (tela do CarPlay/Android Auto) | 4:3 |
| `projeto-04-eletrica.jpg` | Folha 06 · ficha P-04 | Bateria, porta-fusível e cabo passando pelo assoalho | 4:3 |

## Dados que o dono precisa preencher

- **Preços dos perfis** (Folha 02): hoje aparecem como "Sob consulta". Os campos têm `data-preencher="preco-trio"`, `preco-upgrade` e `preco-pressao` no `index.html`. Se quiser, troque por "a partir de R$ X".
- **Fichas de projeto** (Folha 06): modelo/ano do carro e equipamento real de cada trabalho.
- **Avaliações** (Folha 08): três espaços com `data-avaliacao="1..3"` aguardando avaliações reais do Google (texto, nome, data, nota). Não use depoimentos inventados.
- **Garantia**: o site diz "garantia por escrito" sem prazo. Se houver um prazo fixo (ex.: 90 dias para a instalação), vale incluir nas Regras da bancada (7.4) e no FAQ.
