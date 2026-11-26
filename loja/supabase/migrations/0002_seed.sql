-- G-Code · 0002_seed.sql — dados iniciais tirados do catálogo atual e das nossas conversas
-- Rode depois do 0001_schema.sql.

insert into public.categorias (slug, nome, ordem) values
  ('org', 'Organização', 10),
  ('dec', 'Decoração', 20),
  ('rel', 'Relógios', 30),
  ('mus', 'Música', 40),
  ('fe', 'Fé', 50),
  ('chav', 'Chaveiros e lembranças', 60),
  ('festa', 'Festas', 70),
  ('neg', 'Para o seu negócio', 80),
  ('arte', 'Criação de arte', 90),
  ('coz', 'Cozinha', 100),
  ('ades', 'Adesivos e rótulos', 110),
  ('hol', 'Holístico e símbolos', 120)
on conflict (slug) do update set nome = excluded.nome, ordem = excluded.ordem;

-- Produtos (preço vazio = "sob consulta"; ajuste no painel)
insert into public.produtos (slug, categoria, titulo, descricao, tecnica, dimensoes, preco, preco_a_partir_de, status, tipo, prazo_producao_dias, personalizavel, personalizacao_url, destaque, foto_real, ml_item_id, ml_url, ordem) values
  ('porta', 'org', 'Organizador porta-celular', 'Celular, chaves, carteira e relógio num lugar só, em MDF.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, true, null, null, 10),
  ('suporte', 'org', 'Suporte de mesa com ganchos', 'Peça de encaixe para pendurar e organizar na bancada.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, true, null, null, 20),
  ('lapis', 'org', 'Porta-lápis com divisórias', 'Para mesa de escritório ou estudo.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 30),
  ('a4', 'org', 'Organizador de papéis A4', 'Prateleiras para folhas e pastas.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 40),
  ('nicho', 'org', 'Nichos modulares', 'Cubos de encaixe para montar do seu jeito na parede ou na mesa.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 50),
  ('barquinho', 'org', 'Porta-controles barquinho', 'Barco de 27 cm com 3 compartimentos para controles remotos, celular e óculos. A vela divide o meio.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 60),
  ('portaret', 'dec', 'Porta-retrato redondo', 'Ø 15 cm com base de encaixe e fundo com travas para trocar a foto. Gravação personalizada no aro.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 70),
  ('veleiro', 'dec', 'Veleiro de mesa', 'Enfeite de 17 cm para mesa ou prateleira, com base de ondas gravadas.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 80),
  ('vaz', 'dec', 'Palavras vazadas', 'Cantinho do Café, Bar, Lavanderia, Gratidão ou a palavra que você quiser.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 90),
  ('luz', 'dec', 'Quadro luminoso jubarte', 'Quadro em camadas com luz por trás.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 100),
  ('cauda', 'dec', 'Cauda de baleia decorativa', 'Peça de mesa com a cauda da jubarte rendada.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 110),
  ('natal', 'dec', 'Porta-retrato de Natal 10×15', 'Cru gravado ou pintado à mão, com o ano.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 120),
  ('copos', 'mus', 'Porta-copos de cortiça retrô', 'Coleção de 9 desenhos: vinil, fita K7, toca-discos, boombox e mais.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 130),
  ('orat', 'fe', 'Oratório Nossa Senhora da Conceição', 'Em camadas, com base. Também com outros santos.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, true, null, null, 140),
  ('cristo', 'fe', 'Chaveiros de fé', 'Jesus, cruz, pomba, salmo 23 e outros.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 150),
  ('orixas', 'fe', 'Chaveiros dos orixás', 'Oxóssi, Iemanjá, Ogum, Oxum, Iansã, Oxalá e outros.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 160),
  ('zen', 'fe', 'Chaveiros zen', 'Buda, yin-yang, lótus, mandala e outros símbolos.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 170),
  ('esp', 'chav', 'Chaveiros do mar', 'Jubarte, farol, tartaruga, peixes e aves.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 180),
  ('chav', 'chav', 'Chaveiros de jubarte', 'Com nome ou frase, em MDF ou acrílico.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, true, null, null, 190),
  ('chav1', 'chav', 'Chaveiros personalizados', 'Para lembrancinha, empresa ou evento, em quantidade.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, true, null, null, 200),
  ('inox', 'chav', 'Chaveiro metálico gravado', 'Placa metálica pintada com arte gravada a laser.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 210),
  ('kit', 'festa', 'Kit de festa pegue e monte', 'Personagem de chão, painel arco e bandejas no tema escolhido. Desmonta para guardar.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 220),
  ('topo', 'festa', 'Topo de bolo', 'Com o número, o nome e o tema da festa.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 230),
  ('toppers', 'festa', 'Toppers de docinho', 'Kits de 30 no tema da festa.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 240),
  ('band', 'festa', 'Bandeirola com nome', 'Bandeirinhas coloridas com as letras em relevo.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 250),
  ('lembr', 'festa', 'Lembrancinhas', 'Chaveiro ou ímã com o nome e a data, gravado dos dois lados.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 260),
  ('radikit', 'hol', 'Kit de radiestesia', 'Caixa gravada com 6 gráficos (sim/não, porcentagem, alfabeto, chakras, decágono, espiral) e suporte do pêndulo.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 270),
  ('radigraf', 'hol', 'Gráficos de radiestesia avulsos', '15 × 20 cm em MDF gravado, cru ou preto. Também em tamanho grande para consultório.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 280),
  ('flor', 'hol', 'Mandala flor da vida', 'Disco de 30 cm com a flor da vida gravada, para parede ou altar.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 290),
  ('arvore', 'hol', 'Árvore da vida vazada', 'Peça de parede de 30 cm, recortada inteira no MDF.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 300),
  ('chakras', 'hol', 'Placa dos 7 chakras', '11 × 33 cm, com os símbolos gravados e pintados nas cores de cada chakra.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 310),
  ('hamsa', 'hol', 'Mão de Fátima (hamsa)', '20 cm, recortada com o olho e os detalhes gravados. Pintada ou crua.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 320),
  ('memento', 'hol', 'Memento mori', 'Medalhão de 9 cm com caveira e ampulhetas, para mesa ou parede. Também como chaveiro.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 330),
  ('filtro', 'hol', 'Filtro dos sonhos', '25 cm em MDF recortado, com teia e penas. Para quarto de criança ou adulto.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 340),
  ('lua', 'hol', 'Fases da lua', 'Faixa de parede de 34 cm com as 7 fases, em peça única.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 350),
  ('olho', 'hol', 'Olho grego', '5 cm, pintado nas cores tradicionais, como ímã ou chaveiro.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 360),
  ('lotus', 'hol', 'Flor de lótus', '30 cm, recortada com as pétalas gravadas. Pintada em rosa ou crua.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 370),
  ('coztri', 'coz', 'Descanso de panela de cortiça', 'Ø 20 cm, 10 mm de cortiça (2 camadas coladas), gravado com folhas e "bom apetite". Personaliza com o nome da casa.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 380),
  ('cozhex', 'coz', 'Descansos hexagonais (jogo de 3)', 'Hexágonos de 12 cm em cortiça com favos gravados. Juntos viram um descanso grande.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 390),
  ('cozja', 'coz', 'Jogo americano de cortiça', 'Oval 40 × 30 cm com borda de folhinhas gravada. Vende em jogo de 4 ou 6.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 400),
  ('adrot', 'ades', 'Rótulos para potes', 'Temperos, mantimentos, potes de banheiro ou de produtos que você vende. Vinil à prova d''água, no tamanho do seu pote.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 410),
  ('relnome', 'rel', 'Relógio com nome', 'Ø 22 cm em MDF, com o nome da família ou da empresa gravado. Máquina silenciosa sob encomenda.', 'MDF 6 mm gravado, máquina quartzo eixo 19', 'Ø 22 cm', null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 420),
  ('relmand', 'rel', 'Relógio mandala vazada', 'Ø 24 cm, recorte vazado, pintado na cor que você escolher.', 'MDF 6 mm vazado', 'Ø 24 cm', null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 430),
  ('relondas', 'rel', 'Relógio ondas do mar', 'Ø 22 cm com ondas em camadas pintadas, sol e gaivotas gravados.', 'Base MDF 6 mm + ondas em camadas 3 mm', 'Ø 22 cm', null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 440),
  ('relgel', 'rel', 'Relógio tampinha "Hora da gelada"', 'Ø 22 cm em formato de tampinha, para bar, área gourmet e churrasqueira.', 'MDF 6 mm gravado e pintado', 'Ø 22 cm', null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 450),
  ('musonda', 'mus', 'Quadro de onda sonora', 'Eternize um som: música, coração do bebê no ultrassom, latido do pet ou a voz de quem você ama. 30 × 14 cm com base.', 'MDF 3 mm (placa e onda em relevo) + base MDF 6 mm, corte e gravação a laser', '30 × 14 cm', 99.90, false, 'sob_encomenda', 'sob_medida', 5, true, '/onda', true, false, 'MLB5615553467', 'https://produto.mercadolivre.com.br/MLB-5615553467', 460),
  ('musvinil', 'mus', 'Relógio disco de vinil', 'Ø 24 cm com selo central personalizado: nome da família, do casal ou da banda.', 'MDF 3 mm (disco e selo), máquina quartzo eixo 19', 'Ø 24 cm', null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 470),
  ('kitm1', 'arte', 'Kit Marca Básico', 'Logo (criação ou vetorização) com os arquivos + 100 cartões de visita + folha de adesivos redondos + display QR em acrílico. A partir de R$ 249.', null, null, 249.00, true, 'sob_encomenda', 'kit', null, true, null, true, false, null, null, 480),
  ('kitm2', 'arte', 'Kit Marca Completo', 'Identidade simples + 100 cartões + 2 folhas de adesivos + display QR + placa de balcão gravada + 10 chaveiros + 50 tags para embalagem. A partir de R$ 549.', null, null, 549.00, true, 'sob_encomenda', 'kit', null, true, null, false, false, null, null, 490),
  ('artvet', 'arte', 'Vetorização de logo', 'Sua logo de foto ou print para vetor limpo (SVG, PDF e PNG). Grátis na compra de qualquer peça; só o arquivo, a partir de R$ 20.', null, null, 20.00, true, 'sob_encomenda', 'servico', null, true, null, false, false, null, null, 500),
  ('artaj', 'arte', 'Ajuste de arte', 'Troca de texto, cor e tamanho, versão em uma cor e arquivo pronto para o laser. A partir de R$ 15.', null, null, 15.00, true, 'sob_encomenda', 'servico', null, true, null, false, false, null, null, 510),
  ('artlogo', 'arte', 'Criação de logo', 'Logo do zero, com 2 rodadas de ajuste. Como o selo que fizemos para o Buteco Praia do Porto. A partir de R$ 80.', null, null, 80.00, true, 'sob_encomenda', 'servico', null, true, null, false, false, null, null, 520),
  ('artid', 'arte', 'Identidade simples', 'Logo com versões colorida, uma cor e negativa, cores e fonte da marca, num guia de uma página. A partir de R$ 200.', null, null, 200.00, true, 'sob_encomenda', 'servico', null, true, null, false, false, null, null, 530),
  ('adred', 'ades', 'Adesivos redondos para embalagem', 'Com a sua marca, para fechar sacolas, caixas e potes. A partir de uma folha.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 540),
  ('adesc', 'ades', 'Etiquetas escolares', 'Com nome, série e desenho, para material e lancheira. Vinil resistente.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 550),
  ('adpix', 'ades', 'Adesivo Pix e Instagram', 'Folha A4 com os dois adesivos coloridos no tamanho das placas de balcão, com o seu QR conferido.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 560),
  ('qr', 'neg', 'Display de QR Code', 'Instagram e WhatsApp em acrílico preto com base, para o balcão.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 570),
  ('placa', 'neg', 'Placa Pix 6×8 cm', 'Acrílico preto com o seu logo, o QR e o símbolo Pix.', null, null, null, false, 'sob_encomenda', 'sob_medida', null, true, null, false, false, null, null, 580)
on conflict (slug) do nothing;

-- Fotos atuais (servidas pelo GitHub Pages até você subir novas no Storage)
insert into public.produto_imagens (produto_id, url, alt, ordem)
select p.id, v.url, p.titulo, 0
  from (values
    ('porta', 'https://gilbertocrv.github.io/gcode/img/porta.jpg'),
    ('suporte', 'https://gilbertocrv.github.io/gcode/img/suporte.jpg'),
    ('lapis', 'https://gilbertocrv.github.io/gcode/img/lapis.jpg'),
    ('a4', 'https://gilbertocrv.github.io/gcode/img/a4.jpg'),
    ('nicho', 'https://gilbertocrv.github.io/gcode/img/nicho.jpg'),
    ('barquinho', 'https://gilbertocrv.github.io/gcode/img/barquinho.jpg'),
    ('portaret', 'https://gilbertocrv.github.io/gcode/img/portaret.jpg'),
    ('veleiro', 'https://gilbertocrv.github.io/gcode/img/veleiro.jpg'),
    ('vaz', 'https://gilbertocrv.github.io/gcode/img/vaz.jpg'),
    ('luz', 'https://gilbertocrv.github.io/gcode/img/luz.jpg'),
    ('cauda', 'https://gilbertocrv.github.io/gcode/img/cauda.jpg'),
    ('natal', 'https://gilbertocrv.github.io/gcode/img/natal.jpg'),
    ('copos', 'https://gilbertocrv.github.io/gcode/img/copos.jpg'),
    ('orat', 'https://gilbertocrv.github.io/gcode/img/orat.jpg'),
    ('cristo', 'https://gilbertocrv.github.io/gcode/img/cristo.jpg'),
    ('orixas', 'https://gilbertocrv.github.io/gcode/img/orixas.jpg'),
    ('zen', 'https://gilbertocrv.github.io/gcode/img/zen.jpg'),
    ('esp', 'https://gilbertocrv.github.io/gcode/img/esp.jpg'),
    ('chav', 'https://gilbertocrv.github.io/gcode/img/chav.jpg'),
    ('chav1', 'https://gilbertocrv.github.io/gcode/img/chav1.jpg'),
    ('inox', 'https://gilbertocrv.github.io/gcode/img/inox.jpg'),
    ('kit', 'https://gilbertocrv.github.io/gcode/img/leao.jpg'),
    ('topo', 'https://gilbertocrv.github.io/gcode/img/topo.jpg'),
    ('toppers', 'https://gilbertocrv.github.io/gcode/img/toppers.jpg'),
    ('band', 'https://gilbertocrv.github.io/gcode/img/bandeirola.jpg'),
    ('lembr', 'https://gilbertocrv.github.io/gcode/img/lembr.jpg'),
    ('radikit', 'https://gilbertocrv.github.io/gcode/img/radi_kit.jpg'),
    ('radigraf', 'https://gilbertocrv.github.io/gcode/img/radi_graf.jpg'),
    ('flor', 'https://gilbertocrv.github.io/gcode/img/flor.jpg'),
    ('arvore', 'https://gilbertocrv.github.io/gcode/img/arvore.jpg'),
    ('chakras', 'https://gilbertocrv.github.io/gcode/img/chakras.jpg'),
    ('hamsa', 'https://gilbertocrv.github.io/gcode/img/hamsa.jpg'),
    ('memento', 'https://gilbertocrv.github.io/gcode/img/memento.jpg'),
    ('filtro', 'https://gilbertocrv.github.io/gcode/img/filtro.jpg'),
    ('lua', 'https://gilbertocrv.github.io/gcode/img/lua.jpg'),
    ('olho', 'https://gilbertocrv.github.io/gcode/img/olho.jpg'),
    ('lotus', 'https://gilbertocrv.github.io/gcode/img/lotus.jpg'),
    ('coztri', 'https://gilbertocrv.github.io/gcode/img/coz_tri.jpg'),
    ('cozhex', 'https://gilbertocrv.github.io/gcode/img/coz_hex.jpg'),
    ('cozja', 'https://gilbertocrv.github.io/gcode/img/coz_ja.jpg'),
    ('adrot', 'https://gilbertocrv.github.io/gcode/img/ad_rot.jpg'),
    ('relnome', 'https://gilbertocrv.github.io/gcode/img/rel_nome.jpg'),
    ('relmand', 'https://gilbertocrv.github.io/gcode/img/rel_mandala.jpg'),
    ('relondas', 'https://gilbertocrv.github.io/gcode/img/rel_ondas.jpg'),
    ('relgel', 'https://gilbertocrv.github.io/gcode/img/rel_gelada.jpg'),
    ('musonda', 'https://gilbertocrv.github.io/gcode/img/mus_onda.jpg'),
    ('musvinil', 'https://gilbertocrv.github.io/gcode/img/mus_vinil.jpg'),
    ('kitm1', 'https://gilbertocrv.github.io/gcode/img/kit_marca.jpg'),
    ('kitm2', 'https://gilbertocrv.github.io/gcode/img/kit_marca.jpg'),
    ('artvet', 'https://gilbertocrv.github.io/gcode/img/arte_vet.jpg'),
    ('artaj', 'https://gilbertocrv.github.io/gcode/img/arte_aj.jpg'),
    ('artlogo', 'https://gilbertocrv.github.io/gcode/img/arte_logo.jpg'),
    ('artid', 'https://gilbertocrv.github.io/gcode/img/arte_id.jpg'),
    ('adred', 'https://gilbertocrv.github.io/gcode/img/ad_red.jpg'),
    ('adesc', 'https://gilbertocrv.github.io/gcode/img/ad_esc.jpg'),
    ('adpix', 'https://gilbertocrv.github.io/gcode/img/ad_pix.jpg'),
    ('qr', 'https://gilbertocrv.github.io/gcode/img/qr.jpg'),
    ('placa', 'https://gilbertocrv.github.io/gcode/img/placa.jpg')
  ) as v(slug, url)
  join public.produtos p on p.slug = v.slug
 where not exists (select 1 from public.produto_imagens i where i.produto_id = p.id);

-- Custos já calculados na Gestão
insert into public.produto_custos (produto_id, custo_material, tempo_maquina_min, extras, descricao_extras, arquivo_corte)
select id, 2.70, 150, 3.00, 'tinta, cola e embalagem (estimado)', 'D:\CNC LASER\01 MINHAS ARTES\36 Musica' from public.produtos where slug = 'musonda'
on conflict (produto_id) do nothing;
insert into public.produto_custos (produto_id, custo_material, tempo_maquina_min, extras, descricao_extras)
select id, 4.00, 45, 25.00, '100 cartões, 1 folha de adesivo, embalagem (estimado)' from public.produtos where slug = 'kitm1'
union all
select id, 11.80, 125, 50.00, '100 cartões, 2 folhas de adesivo, 50 tags, tinta, argolas (estimado)' from public.produtos where slug = 'kitm2'
on conflict (produto_id) do nothing;

-- Matéria-prima (estoque da Gestão em 26/11/2026)
insert into public.materiais (nome, material, espessura_mm, largura_cm, altura_cm, quantidade, custo_unitario, obs) values
  ('Placa MDF cru 30×30',          'MDF cru',            3, 30, 30, 4, 3.69,  null),
  ('Chapa MDF cru 60×30',          'MDF cru',            3, 60, 30, 4, 6.40,  null),
  ('Placa MDF cru 40×40',          'MDF cru',            6, 40, 40, 3, 5.69,  null),
  ('Placa para sublimação 20×28',  'MDF para sublimação',6, 20, 28, 9, 5.90,  null),
  ('MDF branco 90×40',             'MDF branco',         6, 90, 40, 1, 52.24, 'prateleira'),
  ('Placa MDF branco 40×60',       'MDF branco',         3, 40, 60, 1, 26.60, null),
  ('Retalho de acrílico preto',    'Acrílico',           2, 37, 22, 1, 16.00, 'sobra; medida aproximada'),
  ('Placa de cortiça 5 mm 60×90',  'Cortiça',            5, 60, 90, 0, null,  'preço a definir na compra');
