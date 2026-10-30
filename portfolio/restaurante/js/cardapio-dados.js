/* =====================================================================
   CASA BRASA · DADOS DO SITE E DO CARDÁPIO
   ---------------------------------------------------------------------
   Este é o ÚNICO arquivo que o dono precisa editar para mudar preços,
   pratos, horários e o número do WhatsApp. O site inteiro lê daqui.

   COMO EDITAR UM PRATO
   - Copie um bloco { ... } dentro de "itens" e altere os campos.
   - id ............ nome curto, sem acento e sem espaço (ex.: "picanha-da-casa").
                     Não repita ids. É usado no link do prato.
   - cat ........... id da categoria (veja a lista "categorias").
   - nome .......... nome do prato como aparece no cardápio.
   - desc .......... descrição curta (1 linha e meia, no máximo).
   - longa ......... descrição completa, aparece ao abrir o prato.
   - preco ......... número com PONTO nos centavos (ex.: 54.90).
   - serve ......... quantas pessoas serve (texto) ou "" se não fizer sentido.
   - tags .......... qualquer combinação de: "veg" (vegetariano), "sg" (sem glúten),
                     "picante", "casa" (da casa), "dividir" (para dividir).
   - alergenos ..... lista: "glúten", "lactose", "ovo", "castanhas", "peixe",
                     "crustáceos", "moluscos", "soja", "sulfitos", "álcool".
   - harmoniza ..... ids de outros itens que combinam (aparecem no detalhe).
   - ilustra ....... desenho usado enquanto não há foto. Opções: carne, espeto,
                     peixe, frutos, ave, legume, cumbuca, salgado, queijo, sobremesa,
                     fruta, milho, copo, drink, cerveja, vinho, prato.
   - foto .......... (opcional) caminho da foto, ex.: "img/pratos/picanha.jpg".
                     Quando preenchido, a foto substitui o desenho.
   - dia ........... só no almoço executivo: 1 = segunda ... 5 = sexta.

   Para tirar um prato do ar sem apagar, coloque: esgotado: true
   ===================================================================== */

window.CASA_BRASA = {

  /* ---------- Dados gerais ---------- */
  config: {
    nome: "Casa Brasa",
    whatsapp: "556299208147",          // só números, com 55 + DDD
    endereco: "Rua Exemplo, 100 · Setor Marista",
    cidade: "Goiânia - GO",
    taxaEntrega: 8.90,                 // taxa estimada (o atendente confirma pelo bairro)
    pedidoMinimoDelivery: 50.00,
    tempoDelivery: "40 a 60 min",
    tempoRetirada: "25 a 35 min"
  },

  /* ---------- Horários (0 = domingo ... 6 = sábado) ----------
     Cada dia tem uma lista de turnos ["abre", "fecha"] no formato 24h.
     Dia sem turnos = fechado. */
  horarios: {
    0: [["11:30", "16:30"]],                      // domingo
    1: [["11:30", "15:00"]],                      // segunda (só almoço)
    2: [["11:30", "15:00"], ["18:30", "23:00"]],  // terça
    3: [["11:30", "15:00"], ["18:30", "23:00"]],  // quarta
    4: [["11:30", "15:00"], ["18:30", "23:00"]],  // quinta
    5: [["11:30", "15:00"], ["18:30", "23:30"]],  // sexta
    6: [["11:30", "23:30"]]                       // sábado (direto)
  },

  /* ---------- Categorias (a ordem aqui é a ordem no cardápio) ---------- */
  categorias: [
    { id: "entradas",   nome: "Entradas",          nota: "Para abrir a mesa enquanto a brasa trabalha." },
    { id: "brasa",      nome: "Da brasa",          nota: "Carnes e vegetais assados sobre lenha de eucalipto e carvão de coco. Os cortes saem com sal grosso e chimichurri de pequi." },
    { id: "peixes",     nome: "Peixes e mar",      nota: "Peixes de rio do Centro-Oeste e frutos do mar, sempre na grelha ou na folha de bananeira." },
    { id: "guarnicoes", nome: "Guarnições",        nota: "Acompanhamentos para dividir. Cada porção serve bem 2 pessoas." },
    { id: "executivo",  nome: "Almoço executivo",  nota: "De segunda a sexta, das 11h30 às 15h. Inclui salada da horta ou caldo do dia e uma sobremesa do dia." },
    { id: "sobremesas", nome: "Sobremesas",        nota: "Doces da casa, feitos aqui todos os dias." },
    { id: "sem-alcool", nome: "Sem álcool",        nota: "Sucos de frutas do cerrado, feitos na hora." },
    { id: "drinks",     nome: "Drinks",            nota: "Coquetéis com cachaças goianas e frutas da estação. Venda proibida para menores de 18 anos." },
    { id: "cervejas",   nome: "Cervejas",          nota: "Chopes e cervejas artesanais bem geladas. Venda proibida para menores de 18 anos." },
    { id: "vinhos",     nome: "Vinhos por taça",   nota: "Taça de 150 ml. Pergunte pela carta completa de garrafas. Venda proibida para menores de 18 anos." }
  ],

  /* ---------- Itens ---------- */
  itens: [

    /* ===== ENTRADAS ===== */
    { id: "pao-de-queijo-brasa", cat: "entradas", nome: "Pão de queijo na brasa",
      desc: "Seis unidades de queijo canastra, tostadas na grelha, com manteiga de garrafa.",
      longa: "Massa de polvilho azedo e queijo canastra meia-cura, assada no forno e finalizada na grelha para ganhar casca e aroma de fumaça. Chega à mesa com manteiga de garrafa morna e flor de sal.",
      preco: 28.00, serve: "2 pessoas", tags: ["veg", "sg", "casa"],
      alergenos: ["lactose", "ovo"], harmoniza: ["chope-pilsen", "caipirinha-cagaita"], ilustra: "salgado" },

    { id: "provoleta-baru", cat: "entradas", nome: "Provoleta com mel e baru",
      desc: "Provolone derretido na frigideira de ferro, mel de jataí e baru tostado.",
      longa: "Uma fatia grossa de provolone vai direto à brasa na frigideira de ferro até formar crosta. Finalizamos com mel de abelha jataí, baru tostado e orégano fresco. Sirva com o pão da casa enquanto está borbulhando.",
      preco: 46.00, serve: "2 pessoas", tags: ["veg", "sg", "dividir"],
      alergenos: ["lactose", "castanhas"], harmoniza: ["vinho-tannat", "cerveja-baru"], ilustra: "queijo" },

    { id: "linguica-artesanal", cat: "entradas", nome: "Linguiça artesanal de pernil",
      desc: "Feita na casa, assada inteira e servida com vinagrete de guariroba.",
      longa: "Linguiça de pernil suíno com toucinho, alho e pimenta-do-reino, embutida aqui na cozinha. Assamos devagar, em fogo médio, e servimos fatiada com vinagrete de guariroba e farofa de alho.",
      preco: 42.00, serve: "2 pessoas", tags: ["sg", "dividir"],
      alergenos: [], harmoniza: ["chope-pilsen", "rabo-de-galo"], ilustra: "espeto" },

    { id: "coracao-espeto", cat: "entradas", nome: "Coração de frango no espeto",
      desc: "Marinado em alho e limão-cravo, com farofa crocante de alho.",
      longa: "Corações de frango marinados por uma noite em alho, limão-cravo e azeite, assados no espeto em fogo alto. Acompanha farofa de mandioca com alho dourado.",
      preco: 34.00, serve: "2 pessoas", tags: ["sg"],
      alergenos: [], harmoniza: ["chope-pilsen"], ilustra: "espeto" },

    { id: "pastel-angu", cat: "entradas", nome: "Pastel de angu com carne seca",
      desc: "Seis pastéis de massa de milho, recheio de carne seca e queijo.",
      longa: "Receita de interior: massa de angu de milho, recheio de carne seca desfiada com cebola roxa e queijo meia-cura. Fritos na hora e servidos com geleia de pimenta biquinho.",
      preco: 38.00, serve: "2 pessoas", tags: ["sg", "dividir"],
      alergenos: ["lactose"], harmoniza: ["caipirinha-limao", "chope-ipa"], ilustra: "salgado" },

    { id: "mandioca-pequi", cat: "entradas", nome: "Mandioca crocante com maionese de pequi",
      desc: "Mandioca cozida, prensada e frita, com maionese defumada de pequi.",
      longa: "A mandioca é cozida, prensada em placas e frita em duas etapas para ficar crocante por fora e macia por dentro. Acompanha maionese caseira defumada com pequi. Atenção: o pequi tem espinhos no caroço; aqui ele chega só em creme.",
      preco: 32.00, serve: "2 pessoas", tags: ["veg", "sg"],
      alergenos: ["ovo"], harmoniza: ["pequi-tonic", "chope-pilsen"], ilustra: "salgado" },

    { id: "bolinho-costela", cat: "entradas", nome: "Bolinho de arroz com costela",
      desc: "Oito bolinhos recheados com a costela de 12 horas e queijo.",
      longa: "Aproveitamos a costela de chão desfiada para rechear bolinhos de arroz com queijo coalho e cheiro-verde. Crocantes, servidos com molho de pimenta-de-cheiro.",
      preco: 39.00, serve: "2 a 3 pessoas", tags: ["dividir", "picante"],
      alergenos: ["glúten", "lactose", "ovo"], harmoniza: ["chope-ipa"], ilustra: "salgado" },

    { id: "tartar-mignon", cat: "entradas", nome: "Tartar de mignon na faca",
      desc: "Mignon picado na ponta da faca, gema curada e chips de mandioca.",
      longa: "Filé-mignon picado na faca, temperado com mostarda, alcaparras, cebola roxa e azeite de baru. Por cima, gema curada no sal e açúcar. Chips de mandioca para acompanhar.",
      preco: 58.00, serve: "1 a 2 pessoas", tags: ["sg"],
      alergenos: ["ovo", "castanhas"], harmoniza: ["vinho-espumante", "negroni-rapadura"], ilustra: "carne" },

    /* ===== DA BRASA ===== */
    { id: "picanha-da-casa", cat: "brasa", nome: "Picanha da casa",
      desc: "400 g de picanha maturada, em peça, fatiada na mesa com chimichurri de pequi.",
      longa: "Picanha de novilho precoce, maturada por 21 dias, assada em peça inteira com capa de gordura sobre a lenha. Fatiamos na tábua, na sua mesa, no ponto que você pedir. Sal grosso, chimichurri de pequi e farofa de banana-da-terra acompanham.",
      preco: 169.00, serve: "2 pessoas", tags: ["sg", "casa", "dividir"],
      alergenos: [], harmoniza: ["vinho-malbec", "arroz-pequi", "farofa-banana"], ilustra: "carne" },

    { id: "costela-de-chao", cat: "brasa", nome: "Costela de chão 12 horas",
      desc: "Costela bovina assada no fogo de chão por uma noite inteira, desmanchando.",
      longa: "Nosso prato mais pedido. A ripa de costela é amarrada em estacas e assada ao lado do fogo de chão por 12 horas, só com sal grosso. Chega desmanchando, com mandioca na manteiga e vinagrete. Produção limitada por dia.",
      preco: 149.00, serve: "2 a 3 pessoas", tags: ["sg", "casa", "dividir"],
      alergenos: ["lactose"], harmoniza: ["vinho-syrah-cerrado", "mandioca-manteiga"], ilustra: "carne" },

    { id: "ancho-maturado", cat: "brasa", nome: "Bife ancho maturado 30 dias",
      desc: "350 g de ancho com marmoreio alto, crosta de sal e manteiga de ervas.",
      longa: "Corte do contrafilé dianteiro, com gordura entremeada que derrete na brasa. Maturado a seco por 30 dias na nossa câmara. Selado em fogo alto e finalizado com manteiga de ervas do cerrado.",
      preco: 139.00, serve: "1 pessoa", tags: ["sg"],
      alergenos: ["lactose"], harmoniza: ["vinho-tannat", "batata-murro"], ilustra: "carne" },

    { id: "fraldinha-ervas", cat: "brasa", nome: "Fraldinha na manteiga de ervas",
      desc: "300 g de fraldinha suculenta, manteiga de alho e alecrim.",
      longa: "A fraldinha é um corte de fibras longas que pede brasa forte e pouco tempo. Servimos ao ponto para malpassado, fatiada contra a fibra, com manteiga de alho e alecrim derretendo por cima.",
      preco: 98.00, serve: "1 pessoa", tags: ["sg"],
      alergenos: ["lactose"], harmoniza: ["vinho-malbec", "feijao-tropeiro"], ilustra: "carne" },

    { id: "cupim-casqueirado", cat: "brasa", nome: "Cupim casqueirado",
      desc: "Cupim assado lentamente e casqueirado na hora, com mandioca.",
      longa: "Assamos o cupim por seis horas embrulhado em papel manteiga e, na hora de servir, levamos à grelha bem quente para formar a casquinha. Macio por dentro, crocante por fora. Acompanha mandioca cozida.",
      preco: 92.00, serve: "1 a 2 pessoas", tags: ["sg"],
      alergenos: [], harmoniza: ["chope-ipa", "vinagrete"], ilustra: "carne" },

    { id: "barriga-laqueada", cat: "brasa", nome: "Barriga de porco laqueada",
      desc: "Pururuca crocante, laca de rapadura e pimenta-de-cheiro.",
      longa: "Barriga suína cozida em baixa temperatura e terminada na brasa até a pele estourar em pururuca. Pincelamos com laca de rapadura, shoyu e pimenta-de-cheiro. Picância média.",
      preco: 88.00, serve: "1 a 2 pessoas", tags: ["picante"],
      alergenos: ["soja", "glúten"], harmoniza: ["cerveja-baru", "salada-cagaita"], ilustra: "carne" },

    { id: "galeto-limao-cravo", cat: "brasa", nome: "Galeto na brasa",
      desc: "Galeto inteiro marinado em limão-cravo, alho e ervas, com polenta frita.",
      longa: "Galeto aberto em borboleta, marinado por 24 horas em limão-cravo, alho, cachaça e ervas, assado devagar sobre a lenha. Acompanha polenta frita e molho da própria assadura.",
      preco: 79.00, serve: "1 a 2 pessoas", tags: ["sg"],
      alergenos: ["álcool"], harmoniza: ["vinho-sauvignon", "guariroba-milho"], ilustra: "ave" },

    { id: "tomahawk", cat: "brasa", nome: "Tomahawk 1 kg",
      desc: "O corte com osso para a mesa toda. Fatiado na tábua, com três guarnições.",
      longa: "Contrafilé com o osso da costela, cerca de 1 kg, assado em fogo indireto e selado no final. Vai para a mesa na tábua, fatiado, com arroz de pequi, farofa de banana-da-terra e vinagrete.",
      preco: 289.00, serve: "3 pessoas", tags: ["sg", "dividir"],
      alergenos: [], harmoniza: ["vinho-syrah-cerrado"], ilustra: "carne" },

    { id: "prancha-casa-brasa", cat: "brasa", nome: "Prancha Casa Brasa",
      desc: "Picanha, costela de chão, linguiça artesanal e galeto, com quatro guarnições.",
      longa: "Para quem quer provar um pouco de tudo: picanha fatiada, uma porção da costela de 12 horas, linguiça artesanal de pernil e meio galeto. Acompanham arroz de pequi, feijão tropeiro, mandioca na manteiga e vinagrete.",
      preco: 389.00, serve: "4 pessoas", tags: ["casa", "dividir"],
      alergenos: ["lactose", "glúten", "ovo"], harmoniza: ["vinho-malbec", "chope-pilsen"], ilustra: "espeto" },

    { id: "couve-flor-brasa", cat: "brasa", nome: "Couve-flor inteira na brasa",
      desc: "Assada na lenha, com tahine de baru, coalhada e ervas frescas.",
      longa: "Nosso prato principal vegetariano. A couve-flor inteira é cozida no vapor e terminada sobre a brasa até tostar. Vai à mesa sobre coalhada seca, com tahine de baru, gergelim e ervas.",
      preco: 72.00, serve: "1 a 2 pessoas", tags: ["veg", "sg"],
      alergenos: ["lactose", "castanhas"], harmoniza: ["vinho-rose", "salada-cagaita"], ilustra: "legume" },

    { id: "abobora-cabotia", cat: "brasa", nome: "Cabotiá na brasa com coalhada",
      desc: "Gomos de abóbora tostados, coalhada, pimenta biquinho e mel.",
      longa: "Abóbora cabotiá em gomos, assada na brasa até caramelizar. Servimos sobre coalhada fresca, com pimenta biquinho, mel e farofinha de baru. Funciona como principal ou para dividir.",
      preco: 62.00, serve: "1 a 2 pessoas", tags: ["veg", "sg"],
      alergenos: ["lactose", "castanhas"], harmoniza: ["vinho-sauvignon"], ilustra: "legume" },

    /* ===== PEIXES E MAR ===== */
    { id: "pintado-bananeira", cat: "peixes", nome: "Pintado na folha de bananeira",
      desc: "Posta de pintado assada na folha, com moqueca de guariroba e pirão.",
      longa: "O pintado é embrulhado na folha de bananeira com leite de coco, urucum e cheiro-verde e vai para a brasa. Acompanha moqueca de guariroba (o palmito amargo do cerrado), arroz branco e pirão.",
      preco: 112.00, serve: "1 pessoa", tags: ["sg", "casa"],
      alergenos: ["peixe"], harmoniza: ["vinho-sauvignon", "caipirinha-cagaita"], ilustra: "peixe" },

    { id: "costela-tambaqui", cat: "peixes", nome: "Costela de tambaqui",
      desc: "Costelinhas de tambaqui na grelha, manteiga de limão-cravo e farofa.",
      longa: "A costela do tambaqui é a parte mais saborosa do peixe. Grelhamos com pele até ficar crocante e finalizamos com manteiga de limão-cravo. Acompanha farofa de banana-da-terra e vinagrete.",
      preco: 98.00, serve: "1 a 2 pessoas", tags: ["sg"],
      alergenos: ["peixe", "lactose"], harmoniza: ["chope-pilsen", "vinho-espumante"], ilustra: "peixe" },

    { id: "pirarucu-baru", cat: "peixes", nome: "Pirarucu com crosta de baru",
      desc: "Lombo de pirarucu manejado, crosta de baru e purê de mandioquinha.",
      longa: "Pirarucu de manejo sustentável, grelhado e coberto com crosta de baru e ervas. Servido sobre purê de mandioquinha com azeite de limão.",
      preco: 116.00, serve: "1 pessoa", tags: ["sg"],
      alergenos: ["peixe", "castanhas", "lactose"], harmoniza: ["vinho-rose"], ilustra: "peixe" },

    { id: "camarao-espeto", cat: "peixes", nome: "Camarão no espeto",
      desc: "Camarões grandes com alho, pimenta-de-cheiro e arroz de coco.",
      longa: "Dez camarões grandes no espeto, marinados em alho, azeite e pimenta-de-cheiro, assados rapidamente em fogo alto. Acompanha arroz de coco com castanha. Picância leve.",
      preco: 118.00, serve: "1 pessoa", tags: ["sg", "picante"],
      alergenos: ["crustáceos", "castanhas"], harmoniza: ["vinho-espumante", "moscow-mule"], ilustra: "frutos" },

    { id: "polvo-brasa", cat: "peixes", nome: "Polvo na brasa",
      desc: "Tentáculos macios e tostados, batatas ao murro e páprica defumada.",
      longa: "O polvo é cozido lentamente até ficar macio e depois vai à grelha bem quente para tostar. Servido com batatas ao murro, alho confit, azeite e páprica defumada.",
      preco: 138.00, serve: "1 pessoa", tags: ["sg"],
      alergenos: ["moluscos"], harmoniza: ["vinho-rose"], ilustra: "frutos" },

    /* ===== GUARNIÇÕES ===== */
    { id: "arroz-pequi", cat: "guarnicoes", nome: "Arroz de pequi",
      desc: "O clássico goiano, soltinho e perfumado. Cuidado com o caroço.",
      longa: "Arroz refogado com pequi inteiro, alho e açafrão-da-terra. O pequi se come roendo a polpa, sem morder: o caroço tem espinhos. Se preferir, pedimos para servir só com a polpa.",
      preco: 32.00, serve: "2 pessoas", tags: ["veg", "sg", "casa"],
      alergenos: [], harmoniza: ["picanha-da-casa"], ilustra: "cumbuca" },

    { id: "farofa-banana", cat: "guarnicoes", nome: "Farofa de banana-da-terra",
      desc: "Farinha de mandioca torrada na manteiga com banana caramelizada.",
      longa: "Farinha de mandioca torrada na manteiga com cebola, banana-da-terra caramelizada e cheiro-verde.",
      preco: 24.00, serve: "2 pessoas", tags: ["veg", "sg"],
      alergenos: ["lactose"], harmoniza: ["picanha-da-casa"], ilustra: "cumbuca" },

    { id: "feijao-tropeiro", cat: "guarnicoes", nome: "Feijão tropeiro",
      desc: "Feijão, farinha, ovo, linguiça, torresmo e couve.",
      longa: "Feijão-carioca cozido no ponto, salteado com farinha de mandioca, ovo mexido, linguiça, torresmo e couve fininha.",
      preco: 29.00, serve: "2 pessoas", tags: ["sg"],
      alergenos: ["ovo"], harmoniza: ["fraldinha-ervas"], ilustra: "cumbuca" },

    { id: "mandioca-manteiga", cat: "guarnicoes", nome: "Mandioca na manteiga",
      desc: "Mandioca cozida e dourada na manteiga de garrafa.",
      longa: "Mandioca amarela cozida até abrir, depois dourada na manteiga de garrafa com flor de sal.",
      preco: 24.00, serve: "2 pessoas", tags: ["veg", "sg"],
      alergenos: ["lactose"], harmoniza: ["costela-de-chao"], ilustra: "cumbuca" },

    { id: "guariroba-milho", cat: "guarnicoes", nome: "Guariroba com milho verde",
      desc: "O palmito amarguinho do cerrado, refogado com milho e cebolinha.",
      longa: "A guariroba é um palmito nativo de Goiás, de sabor levemente amargo. Refogamos com milho verde, alho e cebolinha. Combina muito com carnes gordas.",
      preco: 29.00, serve: "2 pessoas", tags: ["veg", "sg"],
      alergenos: [], harmoniza: ["galeto-limao-cravo"], ilustra: "milho" },

    { id: "salada-cagaita", cat: "guarnicoes", nome: "Salada da horta",
      desc: "Folhas, tomates, rabanete e vinagrete de cagaita.",
      longa: "Folhas da estação de produtores de Goianápolis, tomates, rabanete, cebola roxa e vinagrete de cagaita, uma fruta azedinha do cerrado.",
      preco: 34.00, serve: "2 pessoas", tags: ["veg", "sg"],
      alergenos: [], harmoniza: ["barriga-laqueada"], ilustra: "legume" },

    { id: "batata-murro", cat: "guarnicoes", nome: "Batata ao murro",
      desc: "Batatas assadas, amassadas e douradas com alho confit.",
      longa: "Batatas assadas com casca, amassadas com a mão e douradas na grelha com azeite, alho confit e alecrim.",
      preco: 28.00, serve: "2 pessoas", tags: ["veg", "sg"],
      alergenos: [], harmoniza: ["ancho-maturado"], ilustra: "legume" },

    { id: "vinagrete", cat: "guarnicoes", nome: "Vinagrete clássico",
      desc: "Tomate, cebola, pimentão e cheiro-verde no vinagre de maçã.",
      longa: "O acompanhamento obrigatório do churrasco: tomate, cebola, pimentão e cheiro-verde picados na hora.",
      preco: 14.00, serve: "2 pessoas", tags: ["veg", "sg"],
      alergenos: [], harmoniza: ["cupim-casqueirado"], ilustra: "cumbuca" },

    /* ===== ALMOÇO EXECUTIVO (dia: 1 = segunda ... 5 = sexta) ===== */
    { id: "exec-galinhada", cat: "executivo", dia: 1, nome: "Galinhada com pequi",
      desc: "Arroz com frango caipira, pequi e açafrão, com salada e torresmo.",
      longa: "A segunda-feira começa com o prato mais goiano que existe: galinhada de frango caipira com pequi, açafrão-da-terra e cheiro-verde. Acompanha salada da horta e torresmo. Inclui salada ou caldo do dia e sobremesa do dia.",
      preco: 54.90, serve: "1 pessoa", tags: ["sg", "casa"],
      alergenos: [], harmoniza: ["suco-cagaita"], ilustra: "prato" },

    { id: "exec-fraldinha", cat: "executivo", dia: 2, nome: "Fraldinha na brasa",
      desc: "Fraldinha fatiada, arroz, feijão, farofa e vinagrete.",
      longa: "Fraldinha assada na brasa e fatiada, com arroz branco, feijão de caldo, farofa de alho e vinagrete. Inclui salada ou caldo do dia e sobremesa do dia.",
      preco: 54.90, serve: "1 pessoa", tags: ["sg"],
      alergenos: [], harmoniza: ["limonada-rapadura"], ilustra: "prato" },

    { id: "exec-feijoada", cat: "executivo", dia: 3, nome: "Feijoada da quarta",
      desc: "Feijoada completa com couve, farofa, laranja e torresmo.",
      longa: "Feijão-preto com carnes defumadas e salgadas, cozido por horas. Acompanha arroz, couve refogada, farofa, laranja e torresmo. Inclui salada ou caldo do dia e sobremesa do dia.",
      preco: 59.90, serve: "1 pessoa", tags: ["sg"],
      alergenos: [], harmoniza: ["caipirinha-limao"], ilustra: "prato" },

    { id: "exec-peixe", cat: "executivo", dia: 4, nome: "Peixe na brasa com pirão",
      desc: "Filé de tilápia grelhado, arroz, pirão e legumes na brasa.",
      longa: "Filé de tilápia temperado com limão e ervas, grelhado na brasa. Acompanha arroz branco, pirão e legumes da estação assados. Inclui salada ou caldo do dia e sobremesa do dia.",
      preco: 54.90, serve: "1 pessoa", tags: ["sg"],
      alergenos: ["peixe"], harmoniza: ["suco-cagaita"], ilustra: "prato" },

    { id: "exec-costela", cat: "executivo", dia: 5, nome: "Costela de chão com mandioca",
      desc: "Porção da costela de 12 horas, mandioca na manteiga e arroz.",
      longa: "Sexta é dia de costela: uma porção individual da nossa costela de chão, com mandioca na manteiga, arroz e vinagrete. Inclui salada ou caldo do dia e sobremesa do dia.",
      preco: 64.90, serve: "1 pessoa", tags: ["sg", "casa"],
      alergenos: ["lactose"], harmoniza: ["chope-pilsen"], ilustra: "prato" },

    /* ===== SOBREMESAS ===== */
    { id: "pamonha-brulee", cat: "sobremesas", nome: "Pamonha brûlée",
      desc: "Creme de pamonha doce com casquinha queimada e sorvete de queijo.",
      longa: "Nossa releitura da pamonha goiana: um creme de milho verde assado em ramequim, com açúcar queimado no maçarico. Acompanha sorvete de queijo canastra feito na casa.",
      preco: 34.00, serve: "1 pessoa", tags: ["veg", "sg", "casa"],
      alergenos: ["lactose", "ovo"], harmoniza: ["cafe-coado"], ilustra: "milho" },

    { id: "pudim-doce-de-leite", cat: "sobremesas", nome: "Pudim de doce de leite",
      desc: "Pudim liso de doce de leite, com calda escura e baru crocante.",
      longa: "Pudim feito com doce de leite de fazenda, assado em banho-maria, com calda de caramelo escuro e baru tostado por cima.",
      preco: 28.00, serve: "1 pessoa", tags: ["veg", "sg"],
      alergenos: ["lactose", "ovo", "castanhas"], harmoniza: ["cafe-coado"], ilustra: "sobremesa" },

    { id: "abacaxi-brasa", cat: "sobremesas", nome: "Abacaxi na brasa",
      desc: "Abacaxi com canela caramelizado na grelha e sorvete de coco.",
      longa: "Fatias de abacaxi pérola polvilhadas com canela e açúcar mascavo, caramelizadas na grelha. Servidas com sorvete de coco e raspas de limão.",
      preco: 29.00, serve: "1 pessoa", tags: ["veg", "sg"],
      alergenos: [], harmoniza: ["rabo-de-galo"], ilustra: "fruta" },

    { id: "romeu-julieta", cat: "sobremesas", nome: "Queijo coalho com goiabada",
      desc: "Coalho tostado na brasa com goiabada cascão derretida.",
      longa: "O Romeu e Julieta na versão da brasa: queijo coalho tostado na grelha, goiabada cascão aquecida e um fio de mel.",
      preco: 27.00, serve: "1 a 2 pessoas", tags: ["veg", "sg"],
      alergenos: ["lactose"], harmoniza: ["vinho-tannat"], ilustra: "queijo" },

    { id: "bolo-chocolate", cat: "sobremesas", nome: "Bolo quente de chocolate",
      desc: "Chocolate 70% com centro cremoso e sorvete de baru.",
      longa: "Bolinho de chocolate 70% assado na hora, com o centro cremoso. Acompanha sorvete de baru feito na casa. Leva cerca de 12 minutos.",
      preco: 36.00, serve: "1 pessoa", tags: ["veg"],
      alergenos: ["glúten", "lactose", "ovo", "castanhas"], harmoniza: ["vinho-malbec"], ilustra: "sobremesa" },

    /* ===== SEM ÁLCOOL ===== */
    { id: "suco-cagaita", cat: "sem-alcool", nome: "Suco de cagaita",
      desc: "Fruta azedinha do cerrado, batida na hora. 400 ml.",
      longa: "A cagaita é uma fruta nativa de Goiás, ácida e refrescante. Batida com água e pouco açúcar (ou sem, se preferir).",
      preco: 14.00, serve: "", tags: ["veg", "sg", "casa"],
      alergenos: [], harmoniza: [], ilustra: "copo" },

    { id: "suco-caju", cat: "sem-alcool", nome: "Suco de caju ou maracujá",
      desc: "Polpa natural, batida na hora. 400 ml.",
      longa: "Escolha entre caju e maracujá. Batido na hora, com água ou leite.",
      preco: 13.00, serve: "", tags: ["veg", "sg"],
      alergenos: [], harmoniza: [], ilustra: "copo" },

    { id: "limonada-rapadura", cat: "sem-alcool", nome: "Limonada de rapadura",
      desc: "Limão-taiti, rapadura e hortelã, bem gelada. 400 ml.",
      longa: "Limonada adoçada com rapadura derretida, hortelã fresca e bastante gelo.",
      preco: 15.00, serve: "", tags: ["veg", "sg"],
      alergenos: [], harmoniza: [], ilustra: "copo" },

    { id: "mocktail-caju", cat: "sem-alcool", nome: "Caju com alecrim (sem álcool)",
      desc: "Drink sem álcool de caju, alecrim tostado e água com gás.",
      longa: "Para quem não bebe mas quer um drink: suco de caju, xarope de alecrim tostado na brasa, limão e água com gás.",
      preco: 24.00, serve: "", tags: ["veg", "sg"],
      alergenos: [], harmoniza: [], ilustra: "drink" },

    { id: "refrigerante", cat: "sem-alcool", nome: "Refrigerante lata",
      desc: "Cola, cola zero, guaraná ou laranja. 350 ml.",
      longa: "Opções: cola, cola zero, guaraná e laranja. Informe o sabor na observação.",
      preco: 8.00, serve: "", tags: ["veg", "sg"],
      alergenos: [], harmoniza: [], ilustra: "copo" },

    { id: "agua", cat: "sem-alcool", nome: "Água mineral",
      desc: "Com ou sem gás. 500 ml.",
      longa: "Água mineral com ou sem gás. Informe na observação.",
      preco: 7.00, serve: "", tags: ["veg", "sg"],
      alergenos: [], harmoniza: [], ilustra: "copo" },

    { id: "cafe-coado", cat: "sem-alcool", nome: "Café coado",
      desc: "Café especial do Cerrado Mineiro, coado na hora.",
      longa: "Grãos de torra média de produtores do cerrado, coados no pano na hora. Acompanha uma paçoquinha de baru.",
      preco: 9.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["castanhas"], harmoniza: [], ilustra: "copo" },

    /* ===== DRINKS ===== */
    { id: "caipirinha-cagaita", cat: "drinks", nome: "Caipirinha de cagaita",
      desc: "Cachaça goiana envelhecida, cagaita macerada e limão.",
      longa: "A caipirinha da casa: cachaça goiana envelhecida em amburana, cagaita macerada, um toque de limão e açúcar demerara.",
      preco: 36.00, serve: "", tags: ["veg", "sg", "casa"],
      alergenos: ["álcool"], harmoniza: [], ilustra: "drink" },

    { id: "caipirinha-limao", cat: "drinks", nome: "Caipirinha de limão",
      desc: "Cachaça prata, limão-taiti e açúcar. Clássica.",
      longa: "A clássica, do jeito certo: limão-taiti macerado, açúcar e cachaça prata de alambique. Também com vodca ou saquê.",
      preco: 32.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["álcool"], harmoniza: [], ilustra: "drink" },

    { id: "pequi-tonic", cat: "drinks", nome: "Pequi tonic",
      desc: "Gin infusionado com pequi, tônica e casca de limão-cravo.",
      longa: "Infusionamos gin com pequi por sete dias. Servido com tônica, gelo e casca de limão-cravo. Herbal, amarelinho e com o perfume do cerrado.",
      preco: 42.00, serve: "", tags: ["veg", "sg", "casa"],
      alergenos: ["álcool"], harmoniza: [], ilustra: "drink" },

    { id: "negroni-rapadura", cat: "drinks", nome: "Negroni de rapadura",
      desc: "Gin, bitter e vermute com rapadura defumada na brasa.",
      longa: "O negroni clássico com um vermute adoçado com rapadura defumada na nossa brasa. Amargo, encorpado e com final de fumaça.",
      preco: 44.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["álcool"], harmoniza: [], ilustra: "drink" },

    { id: "rabo-de-galo", cat: "drinks", nome: "Rabo de galo da casa",
      desc: "Cachaça envelhecida, vermute tinto e cynar.",
      longa: "O drink de boteco mais brasileiro, em versão caprichada: cachaça envelhecida, vermute tinto, cynar e casca de laranja.",
      preco: 34.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["álcool"], harmoniza: [], ilustra: "drink" },

    { id: "moscow-mule", cat: "drinks", nome: "Moscow mule de caju",
      desc: "Vodca, caju, limão e espuma de gengibre.",
      longa: "Vodca, suco de caju, limão e xarope de gengibre, coberto com espuma de gengibre. Servido na caneca de cobre.",
      preco: 38.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["álcool"], harmoniza: [], ilustra: "drink" },

    /* ===== CERVEJAS ===== */
    { id: "chope-pilsen", cat: "cervejas", nome: "Chope pilsen",
      desc: "Leve, gelado e com colarinho cremoso. 300 ml.",
      longa: "Chope pilsen de cervejaria goiana, tirado na pressão certa, com dois dedos de colarinho.",
      preco: 14.00, serve: "", tags: ["veg"],
      alergenos: ["glúten", "álcool"], harmoniza: [], ilustra: "cerveja" },

    { id: "chope-ipa", cat: "cervejas", nome: "Chope IPA",
      desc: "Amargor marcante e aroma cítrico de lúpulo. 400 ml.",
      longa: "India Pale Ale artesanal, com aroma de maracujá e pinho e amargor firme. Ótima com carnes gordas.",
      preco: 24.00, serve: "", tags: ["veg"],
      alergenos: ["glúten", "álcool"], harmoniza: [], ilustra: "cerveja" },

    { id: "cerveja-baru", cat: "cervejas", nome: "Brown ale de baru",
      desc: "Cerveja artesanal com baru tostado. Garrafa 500 ml.",
      longa: "Brown ale produzida em parceria com uma cervejaria de Goiânia, com baru tostado na brasa. Notas de castanha, caramelo e café.",
      preco: 32.00, serve: "", tags: ["veg", "casa"],
      alergenos: ["glúten", "castanhas", "álcool"], harmoniza: [], ilustra: "cerveja" },

    { id: "lager-long-neck", cat: "cervejas", nome: "Lager long neck",
      desc: "Cerveja lager tradicional. 355 ml.",
      longa: "Lager tradicional, bem gelada. Pergunte pelas marcas disponíveis no dia.",
      preco: 14.00, serve: "", tags: ["veg"],
      alergenos: ["glúten", "álcool"], harmoniza: [], ilustra: "cerveja" },

    { id: "cerveja-zero", cat: "cervejas", nome: "Cerveja sem álcool",
      desc: "Long neck 0,0%. 355 ml.",
      longa: "Cerveja lager sem álcool, para quem vai dirigir.",
      preco: 13.00, serve: "", tags: ["veg"],
      alergenos: ["glúten"], harmoniza: [], ilustra: "cerveja" },

    /* ===== VINHOS POR TAÇA ===== */
    { id: "vinho-espumante", cat: "vinhos", nome: "Espumante brut",
      desc: "Serra Gaúcha. Fresco, com bolha fina e notas de maçã.",
      longa: "Espumante brut pelo método tradicional, da Serra Gaúcha. Abre bem a refeição e vai bem com peixes e frituras.",
      preco: 34.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["sulfitos", "álcool"], harmoniza: [], ilustra: "vinho" },

    { id: "vinho-sauvignon", cat: "vinhos", nome: "Sauvignon blanc",
      desc: "Chile. Cítrico, herbáceo e refrescante.",
      longa: "Branco chileno do Vale de Casablanca, com notas de maracujá, limão e capim. Ótimo com peixes e com o galeto.",
      preco: 36.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["sulfitos", "álcool"], harmoniza: [], ilustra: "vinho" },

    { id: "vinho-rose", cat: "vinhos", nome: "Rosé seco",
      desc: "Campanha Gaúcha. Leve, com frutas vermelhas frescas.",
      longa: "Rosé seco e delicado, de cor salmão clara. Vai muito bem com o polvo e os pratos vegetarianos.",
      preco: 38.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["sulfitos", "álcool"], harmoniza: [], ilustra: "vinho" },

    { id: "vinho-malbec", cat: "vinhos", nome: "Malbec",
      desc: "Mendoza. Frutado, macio, parceiro natural da picanha.",
      longa: "Malbec de Mendoza com passagem por barrica, notas de ameixa e violeta, taninos macios.",
      preco: 42.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["sulfitos", "álcool"], harmoniza: [], ilustra: "vinho" },

    { id: "vinho-tannat", cat: "vinhos", nome: "Tannat",
      desc: "Uruguai. Encorpado e tânico, para cortes gordos.",
      longa: "Tannat uruguaio de Canelones, encorpado e estruturado. Pede carnes com bastante gordura, como o ancho.",
      preco: 46.00, serve: "", tags: ["veg", "sg"],
      alergenos: ["sulfitos", "álcool"], harmoniza: [], ilustra: "vinho" },

    { id: "vinho-syrah-cerrado", cat: "vinhos", nome: "Syrah do cerrado",
      desc: "Vinho de colheita de inverno do Planalto Central. Especiarias e fruta escura.",
      longa: "Syrah de dupla poda, colhido no inverno seco do Planalto Central. Pimenta-preta, amora e um final longo. Nossa recomendação para a costela de chão.",
      preco: 52.00, serve: "", tags: ["veg", "sg", "casa"],
      alergenos: ["sulfitos", "álcool"], harmoniza: [], ilustra: "vinho" }
  ]
};
