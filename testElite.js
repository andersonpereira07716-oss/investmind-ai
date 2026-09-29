// ==========================================
// INVESTMIND AI - MÓDULO DE ELITE (JS PURO)
// ==========================================

function runMonteCarloSimulation(state, anos = 20) {
  const simulacoes = 1000;
  const resultadosFinais = [];
  const taxaMedia = 0.10; 
  const desvioPadrao = 0.12; 

  for (let i = 0; i < simulacoes; i++) {
    let patrimonio = state.capitalInicial;
    for (let ano = 1; ano <= anos; ano++) {
      const racaRandomica = (Math.random() + Math.random() + Math.random() - 1.5) * 2; 
      const retornoAnual = taxaMedia + desvioPadrao * racaRandomica;
      patrimonio = (patrimonio + state.aporteMensal * 12) * (1 + retornoAnual);
    }
    resultadosFinais.push(patrimonio);
  }

  resultadosFinais.sort((a, b) => a - b);
  return {
    pessimista: resultadosFinais[Math.floor(simulacoes * 0.1)],
    mediano: resultadosFinais[Math.floor(simulacoes * 0.5)],
    otimista: resultadosFinais[Math.floor(simulacoes * 0.9)],
    chanceSucesso: (resultadosFinais.filter(p => p >= state.metaPatrimonio).length / simulacoes) * 100
  };
}

function getAssetAllocation(perfil, exposicaoGlobal) {
  const globalPct = exposicaoGlobal / 100;
  const localPct = 1 - globalPct;

  switch (perfil) {
    case 'Conservador':
      return { rendaFixaLocal: 0.70 * localPct, fiiLocal: 0.20 * localPct, acoesLocais: 0.10 * localPct, etfsGlobaisRendaFixa: 0.60 * globalPct, acoesGlobaisDolar: 0.40 * globalPct };
    case 'Moderado':
      return { rendaFixaLocal: 0.45 * localPct, fiiLocal: 0.25 * localPct, acoesLocais: 0.30 * localPct, etfsGlobaisRendaFixa: 0.30 * globalPct, acoesGlobaisDolar: 0.70 * globalPct };
    default:
      return { rendaFixaLocal: 0.20 * localPct, fiiLocal: 0.20 * localPct, acoesLocais: 0.40 * localPct, acoesGlobaisDolar: 0.85 * globalPct };
  }
}

function calcularMetasFIRE(custoMensal, patrimonioAtual) {
  const gastoAnual = custoMensal * 12;
  const regra4PorCento = 25;
  return {
    leanFire: (gastoAnual * 0.8) * regra4PorCento,
    regularFire: gastoAnual * regra4PorCento,
    fatFire: (gastoAnual * 1.5) * regra4PorCento,
    anosAteIndependencia: (meta) => patrimonioAtual >= meta ? 0 : Math.max(0, Math.log(meta / Math.max(patrimonioAtual, 1000)) / Math.log(1.06)).toFixed(1)
  };
}

const estadoTeste = {
  capitalInicial: 30000,
  aporteMensal: 1500,
  instituicao: "Banco do Brasil",
  objetivo: "Geração de Renda",
  perfilRisco: "Moderado",
  exposicaoGlobal: 15,
  metaPatrimonio: 250000,
  custoVidaDesejado: 5000,
  inflacaoEstimada: 4.5
};

console.log("=== TESTE INVESTMIND ELITE ===");
console.log("Monte Carlo (20 anos):", runMonteCarloSimulation(estadoTeste, 20));
console.log("Alocação:", getAssetAllocation(estadoTeste.perfilRisco, estadoTeste.exposicaoGlobal));
console.log("Metas FIRE:", calcularMetasFIRE(estadoTeste.custoVidaDesejado, estadoTeste.capitalInicial));
