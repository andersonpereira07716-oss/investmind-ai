import React, { useState, useEffect, useRef } from 'react';
import { 
  runMonteCarloSimulation, 
  getAssetAllocation, 
  calcularMetasFIRE, 
  calcularAporteRebalanceamento, 
  verificarAlertasDesvio 
} from '../utils/investMindEngine';

export default function InvestMindEliteUI() {
  const [capital, setCapital] = useState<number>(() => Number(localStorage.getItem('im_capital')) || 30000);
  const [aporte, setAporte] = useState<number>(() => Number(localStorage.getItem('im_aporte')) || 1500);
  const [perfil, setPerfil] = useState<string>(() => localStorage.getItem('im_perfil') || 'Moderado');
  const [exposicao, setExposicao] = useState<number>(() => Number(localStorage.getItem('im_exposicao')) || 15);
  const [meta, setMeta] = useState<number>(() => Number(localStorage.getItem('im_meta')) || 250000);
  const [custoVida, setCustoVida] = useState<number>(() => Number(localStorage.getItem('im_custo')) || 5000);
  const [instituicao, setInstituicao] = useState<string>(() => localStorage.getItem('im_inst') || 'Banco do Brasil (Elite)');
  const [moeda, setMoeda] = useState<string>(() => localStorage.getItem('im_moeda') || 'R$');
  const [telefone, setTelefone] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('im_historico') || '[]'); } catch { return []; }
  });
  const [cenarioEstresse, setCenarioEstresse] = useState<string>('Normal');
  const [notificacaoEnviada, setNotificacaoEnviada] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localStorage.setItem('im_capital', capital.toString());
    localStorage.setItem('im_aporte', aporte.toString());
    localStorage.setItem('im_perfil', perfil);
    localStorage.setItem('im_exposicao', exposicao.toString());
    localStorage.setItem('im_meta', meta.toString());
    localStorage.setItem('im_custo', custoVida.toString());
    localStorage.setItem('im_inst', instituicao);
    localStorage.setItem('im_moeda', moeda);
    localStorage.setItem('im_historico', JSON.stringify(historico));
  }, [capital, aporte, perfil, exposicao, meta, custoVida, instituicao, moeda, historico]);

  const formatarMoeda = (val: number) => {
    return `${moeda} ${val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
  };

  const executarAnaliseProfissional = () => {
    setCarregando(true);
    setTimeout(() => {
      let fatorStress = 1.0;
      if (cenarioEstresse === 'Crise Global') fatorStress = 0.85;
      if (cenarioEstresse === 'Juros Altos (14%)') fatorStress = 1.08;

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
      monteCarlo.mediano *= fatorStress;
      monteCarlo.pessimista *= fatorStress;

      const alocacao = getAssetAllocation(perfil, exposicao);
      const metasFire = calcularMetasFIRE(custoVida, capital);
      
      const carteiraAtual = { 
        rendaFixaLocal: capital * 0.55, 
        acoesLocais: capital * 0.30, 
        acoesGlobaisDolar: capital * 0.15 
      };
      const alertas = verificarAlertasDesvio(carteiraAtual, alocacao);
      const rebalanceamento = calcularAporteRebalanceamento(carteiraAtual, alocacao, aporte);

      const rendaPassivaAnual = monteCarlo.mediano * 0.04;
      const rendaPassivaMensal = rendaPassivaAnual / 12;

      const novoResultado = { 
        monteCarlo, 
        alocacao, 
        metasFire, 
        carteiraAtual, 
        alertas, 
        rebalanceamento, 
        rendaPassivaMensal,
        cenarioEstresse,
        estado,
        data: new Date().toLocaleDateString('pt-BR')
      };

      setResultado(novoResultado);
      setHistorico(prev => [ { data: novoResultado.data, capital, perfil, patrimonioFinal: monteCarlo.mediano }, ...prev.slice(0, 4) ]);
      setCarregando(false);
      setNotificacaoEnviada(false);
    }, 400);
  };

  useEffect(() => {
    if (!resultado || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const anos = [0, 5, 10, 15, 20];
    const valores = [
      capital,
      capital + aporte * 60 * 1.3,
      capital + aporte * 120 * 1.6,
      capital + aporte * 180 * 2.1,
      resultado.monteCarlo.mediano
    ];

    const maxVal = Math.max(...valores);
    const w = canvas.width;
    const h = canvas.height;
    const padding = 30;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = padding + (h - 2 * padding) * (i / 3);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    anos.forEach((_, idx) => {
      const x = padding + (idx / (anos.length - 1)) * (w - 2 * padding);
      const y = h - padding - ((valores[idx] / maxVal) * (h - 2 * padding));
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    anos.forEach((ano, idx) => {
      const x = padding + (idx / (anos.length - 1)) * (w - 2 * padding);
      const y = h - padding - ((valores[idx] / maxVal) * (h - 2 * padding));
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${ano}a`, x - 8, h - 10);
    });
  }, [resultado]);

  const exportarPDF = () => {
    if (!resultado) return;
    const conteudoHtml = `
      <html>
        <head><title>InvestMind AI - Relatório Executivo Master</title></head>
        <body style="font-family: Arial; padding: 25px; background: #0f172a; color: #f8fafc;">
          <h1 style="color: #38bdf8;">InvestMind AI - Relatório Executivo Nota 10</h1>
          <p><strong>Instituição:</strong> ${resultado.estado.instituicao} | <strong>Perfil:</strong> ${resultado.estado.perfilRisco}</p>
          <p><strong>Cenário de Estresse:</strong> ${resultado.cenarioEstresse}</p>
          <hr style="border-color: #334155;"/>
          <h3>Projeção de Patrimônio & Renda Passiva (${moeda})</h3>
          <p>Patrimônio Mediano (20 anos): ${formatarMoeda(resultado.monteCarlo.mediano)}</p>
          <p>Renda Passiva Mensal Estimada: ${formatarMoeda(resultado.rendaPassivaMensal)}</p>
          <p>Prazo para Atingir Meta FIRE: ${resultado.metasFire.anosNecessarios.toFixed(1)} anos</p>
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
    const texto = encodeURIComponent(`*InvestMind AI - Enterprise Report*\nPatrimônio Projetado: ${formatarMoeda(resultado.monteCarlo.mediano)}\nRenda Passiva: ${formatarMoeda(resultado.rendaPassivaMensal)}/mês`);
    window.open(`https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`, '_blank');
    setNotificacaoEnviada(true);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto space-y-6 shadow-2xl border border-slate-900">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">InvestMind AI <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">Enterprise Edition</span></h2>
          <p className="text-sm text-slate-400">Robo-Advisor com Simulação de Stress, Gráfico Canvas & Motor FIRE</p>
        </div>
        <div>
          <select value={moeda} onChange={e => setMoeda(e.target.value)} className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs rounded p-2 font-bold">
            <option value="R$">R$ (BRL)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-400">Capital Inicial ({moeda})</label>
          <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Aporte Mensal ({moeda})</label>
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
          <label className="text-xs text-slate-400">Cenário de Estresse Econômico</label>
          <select value={cenarioEstresse} onChange={e => setCenarioEstresse(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-cyan-300 font-bold">
            <option value="Normal">Normal (Expectativa de Mercado)</option>
            <option value="Crise Global">Crise Global (-15% Volatilidade)</option>
            <option value="Juros Altos (14%)">Juros Altos (+8% Rendimento)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Custo de Vida / Mês ({moeda})</label>
          <input type="number" value={custoVida} onChange={e => setCustoVida(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={executarAnaliseProfissional} 
          disabled={carregando}
          className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl transition shadow-lg shadow-cyan-900/30 flex justify-center items-center gap-2"
        >
          {carregando ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Processando IA...
            </>
          ) : (
            'Executar Análise Enterprise'
          )}
        </button>
        {resultado && (
          <button onClick={exportarPDF} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition border border-slate-700 text-cyan-300">
            📄 Exportar PDF
          </button>
        )}
      </div>

      {resultado && (
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 animate-fadeIn">
          <h3 className="text-lg font-semibold text-cyan-300">📈 Dashboard Analítico & Gráfico de Evolução</h3>
          
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-2">Curva Projetada de Acumulação Patrimonial (0 a 20 Anos)</span>
            <canvas ref={canvasRef} width={600} height={180} className="w-full h-auto max-h-[180px] rounded"></canvas>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">🏖️ Simulador FIRE & Renda Passiva</h4>
              <p className="text-emerald-400 font-bold text-base">{formatarMoeda(resultado.rendaPassivaMensal)} / mês</p>
              <p className="text-xs text-slate-400">Regra de 4% a.a. sobre o patrimônio acumulado em 20 anos ({formatarMoeda(resultado.monteCarlo.mediano)}).</p>
              <p className="text-xs text-cyan-400 pt-1">⏳ Prazo estimado FIRE: <strong>{resultado.metasFire.anosNecessarios.toFixed(1)} anos</strong>.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">⚖️ Alocação Ótima & Rebalanceamento</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Renda Fixa (Alvo)</span><span className="text-cyan-400">{(resultado.alocacao.rendaFixa * 100).toFixed(0)}%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-cyan-500 h-full" style={{ width: `${resultado.alocacao.rendaFixa * 100}%` }}></div></div>
                
                <div className="flex justify-between pt-1"><span>Ações Brasil (Alvo)</span><span className="text-amber-400">{(resultado.alocacao.acoesBrasil * 100).toFixed(0)}%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: `${resultado.alocacao.acoesBrasil * 100}%` }}></div></div>

                <div className="flex justify-between pt-1"><span>Ativos Globais</span><span className="text-emerald-400">{(resultado.alocacao.exterior * 100).toFixed(0)}%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${resultado.alocacao.exterior * 100}%` }}></div></div>
              </div>
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
              onClick={enviarWhatsApp}
              className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-xl transition whitespace-nowrap mt-5"
            >
              {notificacaoEnviada ? '✅ Enviado!' : 'Enviar Relatório'}
            </button>
          </div>
        </div>
      )}

      {historico.length > 0 && (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-300">📊 Histórico de Simulações Recentes</span>
            <button onClick={() => setHistorico([])} className="text-red-400 hover:underline">Limpar</button>
          </div>
          <div className="space-y-1">
            {historico.map((h, i) => (
              <div key={i} className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800/60">
                <span className="text-slate-400">{h.data} — R$ {h.capital.toLocaleString()} ({h.perfil})</span>
                <span className="text-cyan-400 font-bold">Projeção: R$ {Math.round(h.patrimonioFinal).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
