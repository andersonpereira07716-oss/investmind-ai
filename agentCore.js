// agentCore.js - Motor de Estudo e Recomendação de Investimentos
export function analyzeInvestmentProfile(capital, riskTolerance, monthlyContribution = 0) {
  // riskTolerance: 'conservador', 'moderado', 'arrojado'
  let allocation = {};
  let suggestedInstitution = '';

  if (riskTolerance === 'conservador') {
    allocation = {
      'Tesouro Selic / IPCA+': '60%',
      'CDBs de Bancos Médios (com FGC)': '30%',
      'Fundos de Renda Fixa': '10%'
    };
    suggestedInstitution = 'Banco Inter (praticidade e isenção de taxas) ou BTG Pactual (melhores taxas de Renda Fixa).';
  } else if (riskTolerance === 'moderado') {
    allocation = {
      'Tesouro IPCA+': '40%',
      'Fundos Imobiliários (FIIs)': '30%',
      'CDBs / Renda Fixa Privada': '20%',
      'Ações Nacionais (Dividendos)': '10%'
    };
    suggestedInstitution = 'BTG Pactual ou XP Investimentos (amplo catálogo de FIIs e assessoria).';
  } else {
    allocation = {
      'Ações Nacionais e Internacionais': '50%',
      'Fundos Imobiliários (FIIs)': '25%',
      'CDBs de Maior Retorno / Alternativos': '15%',
      'Criptoativos / Renda Variável Global': '10%'
    };
    suggestedInstitution = 'BTG Pactual (plataforma robusta para mercado global e derivativos).';
  }

  // Simulação básica de projeção para 1 ano (exemplo simplificado)
  const estimatedAnnualReturn = riskTolerance === 'conservador' ? 0.11 : riskTolerance === 'moderado' ? 0.135 : 0.16;
  const projectedTotal = capital * (1 + estimatedAnnualReturn) + (monthlyContribution * 12 * 1.05);

  return {
    profile: riskTolerance,
    initialCapital: capital,
    monthlyContribution,
    strategicAllocation: allocation,
    recommendedPlatform: suggestedInstitution,
    projectedValue1Year: projectedTotal.toFixed(2)
  };
}
