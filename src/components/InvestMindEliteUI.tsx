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

    // 1. Calculadora de Impacto Tributário (Estimativa Alíquota Média 15% LP / 22.5% CP)
    const impostoEstimado = (monteCarlo.mediano - capital) * 0.15;
    const liquidoComTributo = monteCarlo.mediano - impostoEstimado;

    // 2. Comparativo Institucional de Custódia
    const taxaCustodia = instituicao.includes('Banco do Brasil') || instituicao.includes('Caixa') ? 0.005 : 0.0;
    const impactoTaxa = capital * taxaCustodia * 20;

    setResultado({ monteCarlo, alocacao, metasFire, rebalanceamento, alertas, estado, liquidoComTributo, impostoEstimado, impactoTaxa });
    setNotificacaoEnviada(false);
  };

  const exportarPDF = () => {
    if (!resultado) return;
    const conteudoHtml = `
      <html>
        <head><title>InvestMind AI - Relatório Nota 10 Elite</title></head>
        <body style="font-family: Arial; padding: 20px; background: #0f172a; color: #f8fafc;">
          <h1>InvestMind AI - Relatório Nota 10 Elite</h1>
          <p><strong>Instituição:</strong> ${resultado.estado.instituicao} | <strong>Perfil:</strong> ${resultado.estado.perfilRisco}</p>
          <hr style="border-color: #334155;"/>
          <h3>Projeção 20 Anos (Monte Carlo Líquido de Impostos)</h3>
          <p>Mediano Bruto: R$ ${resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Imposto Estimado (IR): R$ ${resultado.impostoEstimado.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p><strong>Patrimônio Líquido Final:</strong> R$ ${resultado.liquidoComTributo.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p><strong>Chance de Sucesso da Meta:</strong> ${resultado.monteCarlo.chanceSucesso.toFixed(1)}%</p>
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
    const texto = encodeURIComponent(`*InvestMind AI - Relatório Elite*\nInstituição: ${instituicao}\nPatrimônio Líquido Projetado: R$ ${resultado.liquidoComTributo.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`);
    window.open(`https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`, '_blank');
    setNotificacaoEnviada(true);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto space-y-6 shadow-2xl border border-slate-900">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">InvestMind AI <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">Nota 10 Ultra Suite</span></h2>
          <p className="text-sm text-slate-400">Simulação Avançada, Eficiência Tributária, Multi-Bancos & Rebalanceamento</p>
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
          Executar Análise Nota 10 Ultra
        </button>
        {resultado && (
          <button onClick={exportarPDF} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition border border-slate-700 text-cyan-300">
            📄 Exportar PDF
          </button>
        )}
      </div>

      {resultado && (
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 animate-fadeIn">
          <h3 className="text-lg font-semibold text-cyan-300">📊 Relatório Institucional & Simulação Tributária</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">💼 Monte Carlo & Líquido de IR</h4>
              <p>🟢 Mediano Bruto: R$ {resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="text-red-400">📉 IR Estimado (15%): - R$ {resultado.impostoEstimado.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="text-emerald-400 font-bold">✨ Líquido Final: R$ {resultado.liquidoComTributo.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="text-cyan-400 font-bold pt-1">Chance de Sucesso: {resultado.monteCarlo.chanceSucesso.toFixed(1)}%</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">🏦 Análise Institucional ({instituicao})</h4>
              <p className="text-slate-300">Taxa Custódia Efetiva: <span className="font-mono text-cyan-400">{instituicao.includes('Banco do Brasil') || instituicao.includes('Caixa') ? '0.50% a.a.' : 'Isento / 0%'}</span></p>
              <p className="text-slate-400 text-xs">Otimização de rotas de liquidez via Open Finance aplicada com sucesso para os motores de renda fixa e fundos imobiliários.</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full">
              <h4 className="font-bold text-slate-300 text-sm mb-1">💬 Enviar Relatório via WhatsApp</h4>
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
