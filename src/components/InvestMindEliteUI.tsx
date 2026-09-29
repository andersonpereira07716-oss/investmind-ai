import React, { useState } from 'react';
import { 
  runMonteCarloSimulation, 
  getAssetAllocation, 
  calcularMetasFIRE, 
  calcularAporteRebalanceamento, 
  verificarAlertasDesvio 
} from '../utils/investMindEngine';

export default function InvestMindEliteUI() {
  const [capital, setCapital] = useState(30000);
  const [aporte, setAporte] = useState(1500);
  const [perfil, setPerfil] = useState('Moderado');
  const [exposicao, setExposicao] = useState(15);
  const [meta, setMeta] = useState(250000);
  const [custoVida, setCustoVida] = useState(5000);
  const [instituicao, setInstituicao] = useState('Banco do Brasil');
  const [telefone, setTelefone] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [notificacaoEnviada, setNotificacaoEnviada] = useState(false);

  const executarAnaliseElite = () => {
    const estado = {
      capitalInicial: capital,
      aporteMensal: aporte,
      instituicao: instituicao,
      objetivo: "Geração de Renda",
      perfilRisco: perfil,
      exposicaoGlobal: exposicao,
      metaPatrimonio: meta,
      custoVidaDesejado: custoVida,
      inflacaoEstimada: 4.5
    };

    const monteCarlo = runMonteCarloSimulation(estado, 20);
    const alocacao = getAssetAllocation(perfil, exposicao);
    const metasFire = calcularMetasFIRE(custoVida, capital);
    const carteiraAtual = { rendaFixaLocal: capital * 0.6, acoesLocais: capital * 0.25, acoesGlobaisDolar: capital * 0.15 };
    const rebalanceamento = calcularAporteRebalanceamento(carteiraAtual, alocacao, aporte);
    const alertas = verificarAlertasDesvio(carteiraAtual, alocacao);

    // 1. Otimizador de Alocação por Classe de Ativos
    const otimizacaoClasses = {
      rendaFixa: capital * (alocacao.rendaFixa || 0.5),
      acoesBrasil: capital * (alocacao.acoesBrasil || 0.3),
      exterior: capital * (alocacao.exterior || 0.2)
    };

    // 2. Comparador de Taxas e Custódia Institucional
    const taxaCustodiaAnual = instituicao.includes('Banco do Brasil') || instituicao.includes('Caixa') ? 0.004 : 0.0;
    const impactoTaxa20Anos = capital * taxaCustodiaAnual * 20;

    // 3. Simulador de Rentabilidade Líquida Ajustada (Descontando imposto e taxas)
    const impostoRendaEstimado = (monteCarlo.mediano - capital) * 0.15;
    const liquidoFinalAjustado = monteCarlo.mediano - impostoRendaEstimado - impactoTaxa20Anos;

    setResultado({ 
      monteCarlo, 
      alocacao, 
      metasFire, 
      rebalanceamento, 
      alertas, 
      estado, 
      otimizacaoClasses,
      taxaCustodiaAnual,
      liquidoFinalAjustado 
    });
    setNotificacaoEnviada(false);
  };

  const exportarPDF = () => {
    if (!resultado) return;
    const conteudoHtml = `
      <html>
        <head><title>InvestMind AI - Relatório Integrado Elite</title></head>
        <body style="font-family: Arial; padding: 20px; background: #0f172a; color: #f8fafc;">
          <h1>InvestMind AI - Relatório Consolidado</h1>
          <p><strong>Instituição:</strong> ${resultado.estado.instituicao} | <strong>Perfil:</strong> ${resultado.estado.perfilRisco}</p>
          <hr style="border-color: #334155;"/>
          <h3>Otimização de Portfólio & Líquido Ajustado</h3>
          <p>Patrimônio Líquido Final (P50): R$ ${resultado.liquidoFinalAjustado.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Taxa de Custódia Institucional: ${(resultado.taxaCustodiaAnual * 100).toFixed(2)}% ao ano</p>
          <h3>Alocação Ideal por Classe</h3>
          <p>Renda Fixa: R$ ${resultado.otimizacaoClasses.rendaFixa.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Ações Brasil: R$ ${resultado.otimizacaoClasses.acoesBrasil.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Ativos Internacionais / Exterior: R$ ${resultado.otimizacaoClasses.exterior.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
        </body>
      </html>
    `;
    const janela = window.open('', '_blank');
    if (janela) {
      janela.document.write(conteudoHtml);
      janela.document.close();
      janela.print();
    }
  };

  const enviarRelatorioWhatsApp = () => {
    if (!resultado) return;
    const texto = encodeURIComponent(`*InvestMind AI - Relatório Consolidado*\nLíquido Ajustado: R$ ${resultado.liquidoFinalAjustado.toLocaleString('pt-BR', {maximumFractionDigits: 0})}\nInstituição: ${instituicao}`);
    window.open(`https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`, '_blank');
    setNotificacaoEnviada(true);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto space-y-6 shadow-2xl border border-slate-900">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">InvestMind AI <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">Elite 3-em-1 Suite</span></h2>
          <p className="text-sm text-slate-400">Otimizador de Classes, Comparador Institucional & Rentabilidade Líquida</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-400">Capital Inicial (R$)</label>
          <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Aporte Mensal (R$)</label>
          <input type="number" value={aporte} onChange={e => setAporte(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Instituição Financeira</label>
          <select value={instituicao} onChange={e => setInstituicao(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs">
            <option value="Banco do Brasil">Banco do Brasil</option>
            <option value="Caixa Econômica">Caixa Econômica</option>
            <option value="Nubank / Ultravioleta">Nubank / Ultravioleta</option>
            <option value="BTG Pactual">BTG Pactual</option>
            <option value="XP Investimentos">XP Investimentos</option>
            <option value="Avenue Global">Avenue Global</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Perfil de Risco</label>
          <select value={perfil} onChange={e => setPerfil(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
            <option value="Conservador">Conservador</option>
            <option value="Moderado">Moderado</option>
            <option value="Arrojado">Arrojado / Elite</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Meta de Patrimônio (R$)</label>
          <input type="number" value={meta} onChange={e => setMeta(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Custo de Vida / Mês (R$)</label>
          <input type="number" value={custoVida} onChange={e => setCustoVida(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={executarAnaliseElite} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl transition shadow-lg shadow-cyan-900/30">
          Executar Análise Consolidada 3-em-1
        </button>
        {resultado && (
          <button onClick={exportarPDF} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition border border-slate-700 text-cyan-300">
            📄 Exportar PDF
          </button>
        )}
      </div>

      {resultado && (
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 animate-fadeIn">
          <h3 className="text-lg font-semibold text-cyan-300">📊 Resultados dos 3 Módulos Integrados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">🎯 1 & 3. Otimização & Líquido Final</h4>
              <p className="text-emerald-400 font-bold">Líquido Ajustado (20 anos): R$ {resultado.liquidoFinalAjustado.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-slate-400">Renda Fixa: R$ {resultado.otimizacaoClasses.rendaFixa.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-slate-400">Ações BR: R$ {resultado.otimizacaoClasses.acoesBrasil.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-slate-400">Exterior: R$ {resultado.otimizacaoClasses.exterior.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">🏦 2. Comparativo Institucional</h4>
              <p className="text-slate-300">Instituição: <span className="text-cyan-400 font-bold">{instituicao}</span></p>
              <p className="text-slate-300">Taxa de Custódia: <span className="font-mono text-amber-400">{(resultado.taxaCustodiaAnual * 100).toFixed(2)}% a.a.</span></p>
              <p className="text-xs text-slate-400 pt-1">Simulação otimizada com motores de rebalanceamento automático e alertas de desvio ativados.</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full">
              <h4 className="font-bold text-slate-300 text-sm mb-1">💬 Enviar Relatório Consolidado via WhatsApp</h4>
              <input 
                type="text" 
                placeholder="Seu WhatsApp (ex: 5583999999999)" 
                value={telefone} 
                onChange={e => setTelefone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
              />
            </div>
            <button 
              onClick={enviarRelatorioWhatsApp}
              className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-xl transition whitespace-nowrap mt-5"
            >
              {notificacaoEnviada ? '✅ Enviado!' : 'Enviar Resumo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
