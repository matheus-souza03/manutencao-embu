const LAMPADAS = [
  { valor: "Lâmpada vapor de sódio 70W", texto: "Vapor de sódio 70W" },
  { valor: "Lâmpada vapor de sódio 150W", texto: "Vapor de sódio 150W" },
  { valor: "Lâmpada vapor de sódio 250W", texto: "Vapor de sódio 250W" },
  { valor: "Lâmpada vapor metálico 250W/220V", texto: "Vapor metálico 250W/220V" },
];
const REATORES = [
  { valor: "Reator para lâmpada vapor metálico 250W", texto: "Vapor metálico 250W" },
  { valor: "Reator para lâmpada vapor de sódio 75W/220V", texto: "Vapor de sódio 75W/220V" },
  { valor: "Reator para lâmpada vapor de sódio 150W/220V", texto: "Vapor de sódio 150W/220V" },
  { valor: "Reator para lâmpada vapor de sódio 250W/220V", texto: "Vapor de sódio 250W/220V" },
];
const CABOS = [
  { valor: "Cabo de cobre PP 2 x 2,5 mm²", texto: "Cobre PP 2 x 2,5 mm²" },
  { valor: "Cabo de alumínio isolado 25 mm² – duplex", texto: "Alumínio isolado 25 mm² – duplex" },
];
const LUMINARIAS = [{ valor: "Luminária LED 58W", texto: "LED 58W" }];

// A ordem aqui é a da tela; a das colunas da planilha vem do Apps Script.
export const CAMPOS = [
  { chave: "data", rotulo: "Data do serviço", nome: "a data do serviço", obrigatorio: true, tipo: "data", topo: true },
  { chave: "logradouro", rotulo: "Logradouro", nome: "o logradouro", obrigatorio: true, maiusculas: "words", sugestoes: true },
  { chave: "bairro", rotulo: "Bairro", nome: "o bairro", obrigatorio: true, maiusculas: "words", sugestoes: true },
  // Obrigatório no app. O Apps Script ainda grava "s/n" se chegar vazio.
  { chave: "numero", rotulo: "Nº", nome: "o número", obrigatorio: true, maiusculas: "none", dica: "Sem número? Escreva s/n." },

  // Material com mais de um tipo: escolhe o tipo na lista e digita a quantidade (ou os metros) logo abaixo.
  { secao: "Material usado", explicacao: "Preencha só o que usou.", chave: "lampada", rotulo: "Lâmpada", nome: "a lâmpada", opcoes: LAMPADAS, lista: true },
  { chave: "lampada_qtd", rotulo: "Quantidade", nome: "a quantidade de lâmpadas", tipo: "numero", junto: true, material: "lampada" },
  { chave: "reator", rotulo: "Reator", nome: "o reator", opcoes: REATORES, lista: true },
  { chave: "reator_qtd", rotulo: "Quantidade", nome: "a quantidade de reatores", tipo: "numero", junto: true, material: "reator" },
  { chave: "cabo", rotulo: "Cabo", nome: "o cabo", opcoes: CABOS, lista: true },
  { chave: "cabo_metros", rotulo: "Metros", nome: "os metros de cabo", tipo: "numero", decimais: true, junto: true, material: "cabo" },
  { chave: "luminaria", rotulo: "Luminária", nome: "a luminária", opcoes: LUMINARIAS, lista: true },
  { chave: "luminaria_qtd", rotulo: "Quantidade", nome: "a quantidade de luminárias", tipo: "numero", junto: true, material: "luminaria" },
  // Material de um tipo só: só a quantidade.
  { chave: "conector_perfurante_qtd", rotulo: "Conector perfurante (quantidade)", nome: "a quantidade de conectors perfurantes", tipo: "numero" },
  { chave: "chave_magnetica_qtd", rotulo: "Chave magnética de comando em grupo 2 x 100A (quantidade)", nome: "a quantidade de chaves magnéticas", tipo: "numero" },
  { chave: "base_rele_qtd", rotulo: "Base para relé fotocélula (quantidade)", nome: "a quantidade de bases para relé fotocélula", tipo: "numero" },
  { chave: "rele_qtd", rotulo: "Relé fotoelétrico com capacidade de 1000W (quantidade)", nome: "a quantidade de relés fotoelétricos", tipo: "numero" },
  { chave: "fita_isolante_qtd", rotulo: "Fita isolante (quantidade)", nome: "a quantidade de fitas isolantes", tipo: "numero" },
  { chave: "armacao_qtd", rotulo: "Armação secundária pesada com um estribo e isolador roldana (quantidade)", nome: "a quantidade de armações secundárias", tipo: "numero" },

  // Texto livre, opcional, no fim do formulário (caixa de várias linhas).
  { secao: "Observações", chave: "observacoes", rotulo: "Escreva se precisar", nome: "as observações", multilinha: true },
];
desta quantidade: com o material em "Não usou", ela fica bloqueada e vazia;
//     com um tipo escolhido, ela é obrigatória e maior que zero
//   secao + explicacao: título que aparece antes do campo
//   teclado, maiusculas: teclado do celular | sugestoes: lembra o que já foi digitado | dica: ajuda

// Materiais da planilha de consumo ("novos materiais/Planilha_Consumo_de_Materiais.xlsx"), com os
// mesmos textos e na mesma ordem (conferidos em 16/11/2026). Para pôr ou tirar uma opção, edite só aqui.
//   valor: o nome da planilha de consumo, que vai para a planilha de lançamentos;
//   texto: o que aparece na lista, sem o começo que o rótulo do campo já diz. O nome inteiro não cabe
//     na lista fechada do celular, e a parte cortada seria a potência.
const LAMPADAS = [
  { valor: "Lâmpada vapor de sódio 70W", texto: "Vapor de sódio 70W" },
  { valor: "Lâmpada vapor de sódio 150W", texto: "Vapor de sódio 150W" },
  { valor: "Lâmpada vapor de sódio 250W", texto: "Vapor de sódio 250W" },
  { valor: "Lâmpada vapor metálico 250W/220V", texto: "Vapor metálico 250W/220V" },
  { valor: "Lâmpada LED 58W", texto: "LED 58W" }
];
const REATORES = [
  { valor: "Reator para lâmpada vapor metálico 250W", texto: "Vapor metálico 250W" },
  { valor: "Reator para lâmpada vapor de sódio 75W/220V", texto: "Vapor de sódio 75W/220V" },
  { valor: "Reator para lâmpada vapor de sódio 150W/220V", texto: "Vapor de sódio 150W/220V" },
  { valor: "Reator para lâmpada vapor de sódio 250W/220V", texto: "Vapor de sódio 250W/220V" },
];
const CABOS = [
  { valor: "Cabo de cobre PP 2 x 2,5 mm²", texto: "Cobre PP 2 x 2,5 mm²" },
  { valor: "Cabo de alumínio isolado 25 mm² – duplex", texto: "Alumínio isolado 25 mm² – duplex" },
];

// A ordem aqui é a da tela; a das colunas da planilha vem do Apps Script.
export const CAMPOS = [
  { chave: "data", rotulo: "Data do serviço", nome: "a data do serviço", obrigatorio: true, tipo: "data", topo: true },
  { chave: "logradouro", rotulo: "Logradouro", nome: "o logradouro", obrigatorio: true, maiusculas: "words", sugestoes: true },
  { chave: "bairro", rotulo: "Bairro", nome: "o bairro", obrigatorio: true, maiusculas: "words", sugestoes: true },
  // Obrigatório no app. O Apps Script ainda grava "s/n" se chegar vazio.
  { chave: "numero", rotulo: "Nº", nome: "o número", obrigatorio: true, maiusculas: "none", dica: "Sem número? Escreva s/n." },

  // Material com mais de um tipo: escolhe o tipo na lista e digita a quantidade (ou os metros) logo abaixo.
  { secao: "Material usado", explicacao: "Preencha só o que usou.", chave: "lampada", rotulo: "Lâmpada", nome: "a lâmpada", opcoes: LAMPADAS, lista: true },
  { chave: "lampada_qtd", rotulo: "Quantidade", nome: "a quantidade de lâmpadas", tipo: "numero", junto: true, material: "lampada" },
  { chave: "reator", rotulo: "Reator", nome: "o reator", opcoes: REATORES, lista: true },
  { chave: "reator_qtd", rotulo: "Quantidade", nome: "a quantidade de reatores", tipo: "numero", junto: true, material: "reator" },
  { chave: "cabo", rotulo: "Cabo", nome: "o cabo", opcoes: CABOS, lista: true },
  { chave: "cabo_metros", rotulo: "Metros", nome: "os metros de cabo", tipo: "numero", decimais: true, junto: true, material: "cabo" },
  // Material de um tipo só: só a quantidade.
  { chave: "conector_perfurante_qtd", rotulo: "Conector perfurante (quantidade)", nome: "a quantidade de conectors perfurantes", tipo: "numero" },
  { chave: "chave_magnetica_qtd", rotulo: "Chave magnética de comando em grupo 2 x 100A (quantidade)", nome: "a quantidade de chaves magnéticas", tipo: "numero" },
  { chave: "base_rele_qtd", rotulo: "Base para relé fotocélula (quantidade)", nome: "a quantidade de bases para relé fotocélula", tipo: "numero" },
  { chave: "rele_qtd", rotulo: "Relé fotoelétrico com capacidade de 1000W (quantidade)", nome: "a quantidade de relés fotoelétricos", tipo: "numero" },
  { chave: "fita_isolante_qtd", rotulo: "Fita isolante (quantidade)", nome: "a quantidade de fitas isolantes", tipo: "numero" },
  { chave: "armacao_qtd", rotulo: "Armação secundária pesada com um estribo e isolador roldana (quantidade)", nome: "a quantidade de armações secundárias", tipo: "numero" },

  // Texto livre, opcional, no fim do formulário (caixa de várias linhas).
  { secao: "Observações", chave: "observacoes", rotulo: "Escreva se precisar", nome: "as observações", multilinha: true },
];
