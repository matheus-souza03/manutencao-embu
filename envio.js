// Envio da fila para o Apps Script: um item por vez, na ordem em que foram registrados.
// Roda na página e no service worker; a trava na fila impede dois envios ao mesmo tempo.
import { URL_APPS_SCRIPT } from "./config.js";
import {
  SITUACAO,
  aplicarResultado,
  bytesParaBase64,
  enviadosParaLimpar,
  estaLiberado,
  interpretarAcesso,
  interpretarResposta,
  lerUrl,
  montarConsultaAcesso,
  montarEnvio,
  novoCodigoAparelho,
  proximoParaEnviar,
} from "./regras.js";

// A trava vale 30 s e é renovada a cada 10 s enquanto o envio anda. Se o Android fechar o app no
// meio do envio, ninguém renova, e em 30 s outro envio (o app reaberto ou o segundo plano) assume.
export const PRAZO_TRAVA_MS = 30 * 1000;
export const RENOVAR_TRAVA_MS = 10 * 1000;
export const TEMPO_LIMITE_MS = 2 * 60 * 1000; // fotos em internet fraca demoram

/** Código deste celular: criado na primeira vez e nunca mais muda (a página e o segundo plano usam o mesmo). */
export function codigoDoAparelho(fila) {
  return fila.garantirControle("aparelho", novoCodigoAparelho());
}

/**
 * Envia o que estiver na fila até acabar, parar num erro ou faltar conexão.
 * Devolve {situacao: "vazio" | "parado" | "tentar_depois" | "ocupado" | "nao_liberado", enviados, mensagem}.
 * "ocupado" traz livreEm: quando a trava do outro envio vence, se ninguém a renovar.
 * "nao_liberado": o escritório ainda não liberou este celular; os lançamentos esperam no celular.
 * `avisar()` é chamado a cada mudança, para a tela se atualizar.
 */
export async function enviarFila({
  fila,
  url = URL_APPS_SCRIPT,
  buscar = (...args) => fetch(...args),
  agora = () => Date.now(),
  avisar = () => {},
  dono = novoDono(),
  renovarCadaMs = RENOVAR_TRAVA_MS,
}) {
  if (!(await fila.pegarTrava(dono, agora(), PRAZO_TRAVA_MS))) {
    const trava = await fila.lerControle("trava");
    return { situacao: "ocupado", enviados: 0, livreEm: trava ? trava.ate : agora() };
  }
  let enviados = 0;
  try {
    // Com a trava na mão, ninguém está enviando: "enviando" que ficou para trás (app fechado no meio) volta a pendente.
    const itens = await fila.listar();
    for (const item of itens.filter((i) => i.situacao === SITUACAO.ENVIANDO)) {
      await fila.atualizarSe(item.id, (i) => i.situacao === SITUACAO.ENVIANDO, { situacao: SITUACAO.PENDENTE });
    }
    const antigos = enviadosParaLimpar(itens, agora());
    if (antigos.length > 0) {
      await fila.apagarVarios(antigos);
      avisar();
    }

    // Todo envio leva o código do celular: a planilha só grava o que vem de um celular liberado.
    const aparelho = await codigoDoAparelho(fila);
    if (!estaLiberado(await fila.lerControle("acesso"), url)) {
      // Pergunta antes de mandar fotos. Pergunta mesmo com a fila vazia, para o aviso da tela sumir
      // assim que o escritório liberar. A planilha pode demorar: a trava é renovada como no envio.
      const renovacao = setInterval(() => fila.pegarTrava(dono, agora(), PRAZO_TRAVA_MS).catch(() => {}), renovarCadaMs);
      let acesso;
      try {
        acesso = await consultarAcesso(url, aparelho, buscar);
      } finally {
        clearInterval(renovacao);
      }
      if (acesso.tipo === "tentar_depois") return { situacao: "tentar_depois", enviados: 0, mensagem: acesso.mensagem };
      await fila.gravarControle("acesso", { url: lerUrl(url), liberado: acesso.tipo === "liberado", conferido_ms: agora() });
      avisar();
      if (acesso.tipo === "nao_liberado") return { situacao: "nao_liberado", enviados: 0, mensagem: acesso.mensagem };
    }

    for (;;) {
      const { item, parado } = proximoParaEnviar(await fila.listar());
      if (!item) return { situacao: "vazio", enviados: enviados };
      if (parado) return { situacao: "parado", enviados: enviados, mensagem: item.ultimo_erro };

      await fila.pegarTrava(dono, agora(), PRAZO_TRAVA_MS); // renova o prazo
      const marcado = await fila.atualizarSe(item.id, (i) => i.situacao === SITUACAO.PENDENTE, { situacao: SITUACAO.ENVIANDO });
      if (!marcado.ok) continue; // foi apagado ou corrigido agora mesmo: olha a fila de novo
      avisar();

      const renovacao = setInterval(() => fila.pegarTrava(dono, agora(), PRAZO_TRAVA_MS).catch(() => {}), renovarCadaMs);
      let resultado;
      try {
        resultado = await postar(url, marcado.item, aparelho, buscar);
      } finally {
        clearInterval(renovacao);
      }
      // Uma resposta atrasada não desfaz o que outro envio já confirmou.
      await fila.atualizarSe(item.id, (atual) => atual.situacao !== SITUACAO.ENVIADO, (atual) => aplicarResultado(atual, resultado, agora()));
      avisar();

      if (resultado.tipo === "enviado") {
        enviados += 1;
        continue;
      }
      if (resultado.tipo === "nao_liberado") {
        // O escritório bloqueou o código depois de liberar: este fica pendente, os seguintes esperam e o
        // próximo envio pergunta de novo antes de mandar fotos.
        await fila.gravarControle("acesso", { url: lerUrl(url), liberado: false, conferido_ms: agora() });
        avisar();
        return { situacao: "nao_liberado", enviados: enviados, mensagem: resultado.mensagem };
      }
      return {
        situacao: resultado.tipo === "erro" ? "parado" : "tentar_depois",
        enviados: enviados,
        mensagem: resultado.mensagem,
      };
    }
  } finally {
    await fila.soltarTrava(dono);
  }
}

async function postar(configurado, item, aparelho, buscar) {
  const url = lerUrl(configurado);
  if (!url) return semUrl();
  let corpo;
  try {
    const [antes, depois] = await Promise.all([paraBase64(item.foto_antes), paraBase64(item.foto_depois)]);
    corpo = JSON.stringify(montarEnvio(item, antes, depois, aparelho));
  } catch (erro) {
    return { tipo: "erro", mensagem: "As fotos deste lançamento se perderam no celular. Corrija escolhendo as fotos de novo." };
  }
  return interpretarResposta(await postarCorpo(url, corpo, buscar));
}

/** Pergunta à planilha se este celular já foi liberado (sem fotos). */
async function consultarAcesso(configurado, aparelho, buscar) {
  const url = lerUrl(configurado);
  if (!url) return semUrl();
  return interpretarAcesso(await postarCorpo(url, JSON.stringify(montarConsultaAcesso(aparelho)), buscar));
}

function semUrl() {
  return {
    tipo: "tentar_depois",
    mensagem: "O app não sabe para onde enviar (falta a URL em config.js). Avise o escritório.",
  };
}

/** O POST em si, igual para o lançamento e para a pergunta. Devolve {status, texto} ou {erroRede, abortado}. */
async function postarCorpo(url, corpo, buscar) {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    // text/plain evita a consulta prévia de CORS, que o Apps Script não atende. O fetch segue o redirecionamento.
    const resposta = await buscar(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: corpo,
      redirect: "follow",
      cache: "no-store",
      signal: controle.signal,
    });
    return { status: resposta.status, texto: await resposta.text() };
  } catch (erro) {
    return { erroRede: true, abortado: erro && erro.name === "AbortError" };
  } finally {
    clearTimeout(relogio);
  }
}

async function paraBase64(blob) {
  return bytesParaBase64(new Uint8Array(await blob.arrayBuffer()));
}

function novoDono() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
