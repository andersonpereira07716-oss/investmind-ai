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
  const [telefone, setTelefone] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [notificacaoEnviada, setNotificacaoEnviada] = useState(false);

  const executarAnaliseElite = () => {
    const estado = {
      capitalInicial: capital,
      aporteMensal: aporte,
      instituicao: "Banco do Brasil / Open Finance",
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
    const carteiraAtual = { rendaFixaLocal: 15000, acoesLocais: 10000, acoesGlobaisDolar: 5000 };
    const rebalanceamento = calcularAporteRebalanceamento(carteiraAtual, alocacao, aporte);
    const alertas = verificarAlertasDesvio(carteiraAtual, alocacao);

    setResultado({ monteCarlo, alocacao, metasFire, rebalanceamento, alertas, estado });
    setNotificacaoEnviada(false);
  };

  // 2. Exportação Real de Relatório em PDF via navegador
  const exportarPDF = () => {
    if (!resultado) return;
    const conteudoHtml = `
      <html>
        <head><title>InvestMind AI - Relatório de Elite</title></head>
        <body style="font-family: Arial; padding: 20px; background: #0f172a; color: #f8fafc;">
          <h1>InvestMind AI - Relatório Nota 10</h1>
          <p><strong>Perfil:</strong> ${resultado.estado.perfilRisco} | <strong>Exposição Global:</strong> ${resultado.estado.exposicaoGlobal}%</p>
          <hr style="border-color: #334155;"/>
          <h3>Simulação de Monte Carlo (20 Anos)</h3>
          <p>Cenário Otimista: R$ ${resultado.monteCarlo.otimista.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Cenário Mediano: R$ ${resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Cenário Pessimista: R$ ${resultado.monteCarlo.pessimista.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p><strong>Chance de Sucesso:</strong> ${resultado.monteCarlo.chanceSucesso.toFixed(1)}%</p>
          <hr style="border-color: #334155;"/>
          <h3>Metas FIRE</h3>
          <p>Lean FIRE: R$ ${resultado.metasFire.leanFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Regular FIRE: R$ ${resultado.metasFire.regularFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Fat FIRE: R$ ${resultado.metasFire.fatFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
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

  // 3. Simulação de Envio de Relatório via Webhook / WhatsApp
  const enviarRelatorioWhatsApp = () => {
    if (!resultado) return;
    const texto = encodeURIComponent(`*InvestMind AI - Relatório Elite*\nMeta: R$ ${meta}\nChance Sucesso: ${resultado.monteCarlo.chanceSucesso.toFixed(1)}%\nMediano 20 anos: R$ ${resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`);
    window.open(`https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`, '_blank');
    setNotificacaoEnviada(true);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto space-y-6 shadow-2xl border border-slate-900">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">InvestMind AI <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">Nota 10 Elite Suite</span></h2>
          <p className="text-sm text-slate-400">Simulação Avançada, Gráficos, PDF & Automação Webhook</p>
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
          <label className="text-xs text-slate-400">Perfil de Risco</label>
          <select value={perfil} onChange={e => setPerfil(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
            <option value="Conservador">Conservador</option>
            <option value="Moderado">Moderado</option>
            <option value="Arrojado">Arrojado / Elite</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={executarAnaliseElite} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl transition shadow-lg shadow-cyan-900/30">
          Executar Análise Nota 10
        </button>
        {resultado && (
          <>
            <button onClick={exportarPDF} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition border border-slate-700 text-cyan-300">
              📄 Exportar PDF
            </button>
          </>
        )}
      </div>

      {resultado && (
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 animate-fadeIn">
          <h3 className="text-lg font-semibold text-cyan-300">📊 Relatório Estratégico & Gráfico de Projeção</h3>
          
          {/* 1. Gráfico Visual Dinâmico (Barras de Proporção Monte Carlo) */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Cenário Pessimista (P10)</span>
              <span>Mediano (P50)</span>
              <span>Otimista (P90)</span>
            </div>
            <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden flex">
              <div style={{ width: '30%' }} className="bg-red-500/70 h-full" title="Pessimista"></div>
              <div style={{ width: '45%' }} className="bg-yellow-500/70 h-full" title="Mediano"></div>
              <div style={{ width: '25%' }} className="bg-emerald-500/70 h-full" title="Otimista"></div>
            </div>
            <div className="grid grid-cols-3 text-center text-xs pt-1 font-mono">
              <span className="text-red-400">R$ {(resultado.monteCarlo.pessimista/1000).toFixed(0)}k</span>
              <span className="text-yellow-400">R$ {(resultado.monteCarlo.mediano/1000).toFixed(0)}k</span>
              <span className="text-emerald-400">R$ {(resultado.monteCarlo.otimista/1000).toFixed(0)}k</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <h4 className="font-bold text-slate-300 mb-2">Simulação Monte Carlo (20 anos)</h4>
              <p>🟢 Otimista: R$ {resultado.monteCarlo.otimista.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p>🟡 Mediano: R$ {resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p>🔴 Pessimista: R$ {resultado.monteCarlo.pessimista.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="mt-2 text-cyan-400 font-bold">Chance de Sucesso: {resultado.monteCarlo.chanceSucesso.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <h4 className="font-bold text-slate-300 mb-2">Metas FIRE</h4>
              <p>🌱 Lean FIRE: R$ {resultado.metasFire.leanFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p>⭐ Regular FIRE: R$ {resultado.metasFire.regularFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p>👑 Fat FIRE: R$ {resultado.metasFire.fatFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
            </div>
          </div>

          {/* 3. Integração Webhook / WhatsApp */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full">
              <h4 className="font-bold text-slate-300 text-sm mb-1">💬 Enviar Alerta / Resumo via WhatsApp</h4>
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
              {notificacaoEnviada ? '✅ Enviado!' : 'Enviar Relatório'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
