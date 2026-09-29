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
  const [aporteExtra, setAporteExtra] = useState(5000);
  const [perfil, setPerfil] = useState('Moderado');
  const [exposicao, setExposicao] = useState(15);
  const [meta, setMeta] = useState(250000);
  const [custoVida, setCustoVida] = useState(5000);
  const [instituicao, setInstituicao] = useState('Banco do Brasil');
  const [telefone, setTelefone] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [notificacaoEnviada, setNotificacaoEnviada] = useState(false);

  const executarAnaliseAvancada = () => {
    const estado = {
      capitalInicial: capital + aporteExtra,
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
    const metasFire = calcularMetasFIRE(custoVida, capital + aporteExtra);
    
    // 1. Cálculo Estimado de IR sobre Ganho de Capital em Renda Variável (Ex: 15% sobre lucro projetado)
    const ganhoBrutoEstimado = monteCarlo.mediano - (capital + aporteExtra);
    const impostoVariavelEstimado = ganhoBrutoEstimado > 0 ? ganhoBrutoEstimado * 0.15 : 0;

    // 2. Simulação do Impacto do Aporte Extra
    const patrimonioSemExtra = monteCarlo.mediano * 0.90; // Comparativo estimado sem o aporte extra

    // 3. Alertas de Desvio de Rebalanceamento
    const carteiraAtual = { rendaFixaLocal: (capital + aporteExtra) * 0.6, acoesLocais: (capital + aporteExtra) * 0.25, acoesGlobaisDolar: (capital + aporteExtra) * 0.15 };
    const alertasDesvio = verificarAlertasDesvio(carteiraAtual, alocacao);

    setResultado({ 
      monteCarlo, 
      alocacao, 
      metasFire, 
      impostoVariavelEstimado, 
      patrimonioSemExtra, 
      alertasDesvio, 
      estado 
    });
    setNotificacaoEnviada(false);
  };

  const exportarPDF = () => {
    if (!resultado) return;
    const conteudoHtml = `
      <html>
        <head><title>InvestMind AI - Relatório Avançado</title></head>
        <body style="font-family: Arial; padding: 20px; background: #0f172a; color: #f8fafc;">
          <h1>InvestMind AI - Relatório de Inteligência Patrimonial</h1>
          <p><strong>Instituição:</strong> ${resultado.estado.instituicao} | <strong>Perfil:</strong> ${resultado.estado.perfilRisco}</p>
          <hr style="border-color: #334155;"/>
          <h3>Projeção & Tributação</h3>
          <p>Patrimônio Projetado (Mediano 20 anos): R$ ${resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Imposto de Renda Estimado (Ganho de Capital): R$ ${resultado.impostoVariavelEstimado.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Impacto do Aporte Extra: R$ ${(resultado.monteCarlo.mediano - resultado.patrimonioSemExtra).toLocaleString('pt-BR', {maximumFractionDigits: 0})} a mais no longo prazo.</p>
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
    const texto = encodeURIComponent(`*InvestMind AI - Relatório Avançado*\nPatrimônio Projetado: R$ ${resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}\nAnos para FIRE: ${resultado.metasFire.anosNecessarios.toFixed(1)} anos`);
    window.open(`https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`, '_blank');
    setNotificacaoEnviada(true);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto space-y-6 shadow-2xl border border-slate-900">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">InvestMind AI <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">Advanced Suite</span></h2>
          <p className="text-sm text-slate-400">Com Imposto Inteligente, Aporte Extra & Alertas de Rebalanceamento</p>
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
          <label className="text-xs text-slate-400">Aporte Extra Único (R$)</label>
          <input type="number" value={aporteExtra} onChange={e => setAporteExtra(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
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
          <label className="text-xs text-slate-400">Custo de Vida / Mês (R$)</label>
          <input type="number" value={custoVida} onChange={e => setCustoVida(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={executarAnaliseAvancada} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl transition shadow-lg shadow-cyan-900/30">
          Executar Análise Advanced Suite
        </button>
        {resultado && (
          <button onClick={exportarPDF} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition border border-slate-700 text-cyan-300">
            📄 Exportar PDF
          </button>
        )}
      </div>

      {resultado && (
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 animate-fadeIn">
          <h3 className="text-lg font-semibold text-cyan-300">🚀 Painel de Inteligência Avançada</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">💡 Impacto do Aporte Extra & Tributação</h4>
              <p className="text-emerald-400">Ganho Adicional pelo Aporte Extra: R$ {(resultado.monteCarlo.mediano - resultado.patrimonioSemExtra).toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="text-amber-400">Projeção de IR sobre Ganho (15%): R$ {resultado.impostoVariavelEstimado.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-slate-400 pt-1">Estimativa calculada sobre o lucro bruto projetado em 20 anos.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">⚖️ Alertas de Rebalanceamento</h4>
              {resultado.alertasDesvio && resultado.alertasDesvio.length > 0 ? (
                resultado.alertasDesvio.map((alerta: string, idx: number) => (
                  <p key={idx} className="text-xs text-cyan-300">⚠️ {alerta}</p>
                ))
              ) : (
                <p className="text-xs text-emerald-400">✅ Sua carteira está alinhada com o perfil ótimo.</p>
              )}
              <p className="text-xs text-slate-400 pt-2">Metas FIRE: Aprox. {resultado.metasFire.anosNecessarios.toFixed(1)} anos restantes.</p>
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
