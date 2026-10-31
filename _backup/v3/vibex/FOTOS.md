# Vibex AudioCar · fotos a enviar

Os espaços de foto são cenas em SVG na paleta da marca (preto, laranja, âmbar e metal), marcadas com o selo "Foto de exemplo".
Para trocar: coloque a foto em `img/` e, dentro do `<figure class="foto" data-foto="...">`, substitua o `<svg>` por
`<img src="img/NOME.jpg" alt="descrição" loading="lazy">`. Depois apague o `<span class="badge">` e a `<figcaption>` (ou troque por uma legenda real).

Dica de direção de foto: carro em ambiente escuro, luz quente (laranja/âmbar) vindo de um lado, metal dos falantes brilhando. Evite fundo de parede branca.

| Arquivo | Onde aparece | O que a foto deve mostrar | Proporção |
|---|---|---|---|
| `perfil-trio.jpg` | Escolha seu som · card "Trio no porta-malas" | Porta-malas aberto com a caixa trio instalada, de frente | 16:9 |
| `bancada.jpg` | Do balcão à entrega (seção clara) | A bancada com um carro aberto e o instalador trabalhando | 4:3 no celular, 6:5 no desktop |
| `projeto-01-trio.jpg` | Saindo da bancada · card grande | Porta-malas aberto mostrando a caixa trio e o acabamento do carpete | vertical/quadrada no desktop (fica alta), 16:8 no tablet: assunto no centro |
| `projeto-02-portas.jpg` | Saindo da bancada | Forro da porta aberto com o falante novo no anel de MDF | 4:3 |
| `projeto-03-multimidia.jpg` | Saindo da bancada | Painel com a multimídia ligada (tela do CarPlay/Android Auto) | 4:3 |
| `projeto-04-eletrica.jpg` | Saindo da bancada | Bateria, porta-fusível e cabo passando pelo assoalho | 4:3 |
| `fachada.jpg` | Passa aqui na loja | Fachada com o letreiro, de preferência no fim da tarde com a luz acesa | larga (cerca de 16:10); deixe o canto inferior direito livre, ali fica o cartão "Como chegar" |

## Dados que o dono precisa preencher

- **Preços dos perfis**: hoje aparecem como "Sob consulta". Os campos têm `data-preencher="preco-trio"`, `preco-upgrade` e `preco-pressao` no `index.html`. Se quiser, troque por "a partir de R$ X".
- **Cards de trabalhos**: modelo/ano do carro e equipamento real de cada trabalho.
- **Avaliações**: três espaços com `data-avaliacao="1..3"` aguardando avaliações reais do Google (texto, nome, data, nota). Não use depoimentos inventados.
- **Garantia**: o site diz "garantia por escrito" sem prazo. Se houver prazo fixo (ex.: 90 dias para a instalação), vale incluir em "Como a bancada trabalha" e no FAQ.
