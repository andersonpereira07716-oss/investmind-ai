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
  const [instituicao, setInstituicao] = useState('Banco do Brasil (Elite)');
  const [telefone, setTelefone] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [notificacaoEnviada, setNotificacaoEnviada] = useState(false);

  const executarAnaliseCompleta = () => {
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
    
    // Simulação da carteira atual vs ideal para rebalanceamento gráfico
    const carteiraAtual = { 
      rendaFixaLocal: capital * 0.55, 
      acoesLocais: capital * 0.30, 
      acoesGlobaisDolar: capital * 0.15 
    };
    const alertas = verificarAlertasDesvio(carteiraAtual, alocacao);
    const rebalanceamento = calcularAporteRebalanceamento(carteiraAtual, alocacao, aporte);

    // Renda Passiva estimada (Regra dos 4% ao ano sobre o patrimônio mediano final)
    const rendaPassivaAnual = monteCarlo.mediano * 0.04;
    const rendaPassivaMensal = rendaPassivaAnual / 12;

    setResultado({ 
      monteCarlo, 
      alocacao, 
      metasFire, 
      carteiraAtual, 
      alertas, 
      rebalanceamento, 
      rendaPassivaMensal,
      estado 
    });
    setNotificacaoEnviada(false);
  };

  const exportarPDF = () => {
    if (!resultado) return;
    const conteudoHtml = `
      <html>
        <head><title>InvestMind AI - Relatório Master Nota 10</title></head>
        <body style="font-family: Arial; padding: 20px; background: #0f172a; color: #f8fafc;">
          <h1>InvestMind AI - Relatório Master Nota 10</h1>
          <p><strong>Instituição:</strong> ${resultado.estado.instituicao} | <strong>Perfil:</strong> ${resultado.estado.perfilRisco}</p>
          <hr style="border-color: #334155;"/>
          <h3>Projeção & Renda Passiva FIRE</h3>
          <p>Patrimônio Mediano (20 anos): R$ ${resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Renda Passiva Mensal Estimada: R$ ${resultado.rendaPassivaMensal.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          <p>Anos para Atingir a Meta FIRE: ${resultado.metasFire.anosNecessarios.toFixed(1)} anos</p>
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

  const enviarWhatsApp = () => {
    if (!resultado) return;
    const texto = encodeURIComponent(`*InvestMind AI - Nota 10 Elite*\nPatrimônio Projetado: R$ ${resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}\nRenda Passiva Mensal: R$ ${resultado.rendaPassivaMensal.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`);
    window.open(`https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`, '_blank');
    setNotificacaoEnviada(true);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto space-y-6 shadow-2xl border border-slate-900">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">InvestMind AI <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">Nota 10 Master</span></h2>
          <p className="text-sm text-slate-400">Com Gráfico Evolutivo, Rebalanceamento Visual & Renda Passiva FIRE</p>
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
            <option value="Banco do Brasil (Elite)">Banco do Brasil (Elite)</option>
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
        <button onClick={executarAnaliseCompleta} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl transition shadow-lg shadow-cyan-900/30">
          Executar Análise Master Nota 10
        </button>
        {resultado && (
          <button onClick={exportarPDF} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition border border-slate-700 text-cyan-300">
            📄 Exportar PDF
          </button>
        )}
      </div>

      {resultado && (
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 animate-fadeIn">
          <h3 className="text-lg font-semibold text-cyan-300">📈 Painel Master Integrado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">🏖️ Simulador de Renda Passiva FIRE</h4>
              <p className="text-emerald-400 font-bold text-base">R$ {resultado.rendaPassivaMensal.toLocaleString('pt-BR', {maximumFractionDigits: 0})} / mês</p>
              <p className="text-xs text-slate-400">Gerado com base na regra de retirada segura de 4% ao ano sobre o patrimônio acumulado em 20 anos (R$ {resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}).</p>
              <p className="text-xs text-cyan-400 pt-1">⏳ Tempo estimado para atingir meta FIRE: <strong>{resultado.metasFire.anosNecessarios.toFixed(1)} anos</strong>.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">⚖️ Rebalanceamento Visual de Ativos</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Renda Fixa (Alvo Ideal)</span><span className="text-cyan-400">{(resultado.alocacao.rendaFixa * 100).toFixed(0)}%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-cyan-500 h-full" style={{ width: `${resultado.alocacao.rendaFixa * 100}%` }}></div></div>
                
                <div className="flex justify-between pt-1"><span>Ações Brasil (Alvo Ideal)</span><span className="text-amber-400">{(resultado.alocacao.acoesBrasil * 100).toFixed(0)}%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: `${resultado.alocacao.acoesBrasil * 100}%` }}></div></div>

                <div className="flex justify-between pt-1"><span>Ativos Globais (Exterior)</span><span className="text-emerald-400">{(resultado.alocacao.exterior * 100).toFixed(0)}%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${resultado.alocacao.exterior * 100}%` }}></div></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full">
              <h4 className="font-bold text-slate-300 text-sm mb-1">💬 Compartilhar Relatório Master no WhatsApp</h4>
              <input 
                type="text" 
                placeholder="Seu WhatsApp (ex: 5583999999999)" 
                value={telefone} 
                onChange={e => setTelefone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
              />
            </div>
            <button 
              onClick={enviarWhatsApp}
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
