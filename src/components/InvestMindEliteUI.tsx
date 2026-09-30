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
  const [moeda, setMoeda] = useState<string>(() => localStorage.getItem('im_moeda')) || 'R$');
  const [alocacaoCripto, setAlocacaoCripto] = useState<number>(() => Number(localStorage.getItem('im_cripto')) || 5);
  const [telefone, setTelefone] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('im_historico_v3') || '[]'); } catch { return []; }
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
    localStorage.setItem('im_cripto', alocacaoCripto.toString());
    localStorage.setItem('im_historico_v3', JSON.stringify(historico));
  }, [capital, aporte, perfil, exposicao, meta, custoVida, instituicao, moeda, alocacaoCripto, historico]);

  const formatarMoeda = (val: number) => {
    return `${moeda} ${val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
  };

  const executarAnaliseProfissional = () => {
    setCarregando(true);
    setTimeout(() => {
      let fatorStress = 1.0;
      if (cenarioEstresse === 'Crise Global') fatorStress = 0.85;
      if (cenarioEstresse === 'Juros Altos (14%)') fatorStress = 1.08;
      if (cenarioEstresse === 'Super Alta Cripto/Global') fatorStress = 1.18;

      const estado = {
        capitalInicial: capital,
        aporteMensal: aporte,
        instituicao: instituicao,
        objetivo: "Geração de Renda & Proteção",
        perfilRisco: perfil,
        exposicaoGlobal: exposicao,
        metaPatrimonio: meta,
        custoVidaDesejado: custoVida,
        inflacaoEstimada: 4.5
      };

      const monteCarlo = runMonteCarloSimulation(estado, 20);
      monteCarlo.mediano *= (fatorStress * (1 + (alocacaoCripto / 100) * 0.2));
      monteCarlo.pessimista *= fatorStress;

      const alocacao = getAssetAllocation(perfil, exposicao);
      const metasFire = calcularMetasFIRE(custoVida, capital);
      
      const carteiraAtual = { 
        rendaFixaLocal: capital * 0.50, 
        acoesLocais: capital * 0.30, 
        acoesGlobaisDolar: capital * (0.20 - (alocacaoCripto/100)),
        criptoAtivos: capital * (alocacaoCripto / 100)
      };
      
      const rendaPassivaMensal = (monteCarlo.mediano * 0.04) / 12;

      const novoResultado = { 
        monteCarlo, 
        alocacao, 
        metasFire, 
        carteiraAtual, 
        rendaPassivaMensal,
        cenarioEstresse,
        alocacaoCripto,
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
      capital + aporte * 60 * 1.35,
      capital + aporte * 120 * 1.7,
      capital + aporte * 180 * 2.2,
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
        <head><title>InvestMind AI - Enterprise Ultimate Report</title></head>
        <body style="font-family: Arial; padding: 25px; background: #0f172a; color: #f8fafc;">
          <h1 style="color: #38bdf8;">InvestMind AI - Relatório Ultimate v3.0</h1>
          <p><strong>Instituição:</strong> ${resultado.estado.instituicao} | <strong>Perfil:</strong> ${resultado.estado.perfilRisco}</p>
          <p><strong>Alocação Cripto/Proteção:</strong> ${resultado.alocacaoCripto}% | <strong>Cenário:</strong> ${resultado.cenarioEstresse}</p>
          <hr style="border-color: #334155;"/>
          <h3>Projeção de Patrimônio & Renda Passiva</h3>
          <p>Patrimônio Mediano (20 anos): ${formatarMoeda(resultado.monteCarlo.mediano)}</p>
          <p>Renda Passiva Mensal Estimada: ${formatarMoeda(resultado.rendaPassivaMensal)}</p>
          <p>Prazo para Meta FIRE: ${resultado.metasFire.anosNecessarios.toFixed(1)} anos</p>
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
    const texto = encodeURIComponent(`*InvestMind AI - Ultimate Report*\nPatrimônio: ${formatarMoeda(resultado.monteCarlo.mediano)}\nRenda Passiva: ${formatarMoeda(resultado.rendaPassivaMensal)}/mês`);
    window.open(`https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`, '_blank');
    setNotificacaoEnviada(true);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto space-y-6 shadow-2xl border border-cyan-900/40">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">InvestMind AI <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">ULTIMATE v3.0</span></h2>
          <p className="text-sm text-slate-400">Plataforma Definitiva com Cripto, Stress Test & Canvas Pro</p>
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
          <label className="text-xs text-slate-400">Cenário de Mercado (Stress Test)</label>
          <select value={cenarioEstresse} onChange={e => setCenarioEstresse(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-cyan-300 font-bold">
            <option value="Normal">Normal (Tendência Histórica)</option>
            <option value="Crise Global">Crise Global (-15%)</option>
            <option value="Juros Altos (14%)">Juros Altos a 14% a.a.</option>
            <option value="Super Alta Cripto/Global">Super Alta Cripto & Tech (+18%)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Alocação em Cripto / HEDGE (%)</label>
          <input type="number" value={alocacaoCripto} onChange={e => setAlocacaoCripto(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-cyan-300 font-bold" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Meta de Patrimônio ({moeda})</label>
          <input type="number" value={meta} onChange={e => setMeta(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Custo de Vida / Mês ({moeda})</label>
          <input type="number" value={custoVida} onChange={e => setCustoVida(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button 
          onClick={executarAnaliseProfissional} 
          disabled={carregando}
          className="flex-1 py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:opacity-90 font-bold rounded-xl transition shadow-xl shadow-cyan-900/50 flex justify-center items-center gap-2 text-white text-sm"
        >
          {carregando ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Processando Inteligência Ultimate...
            </>
          ) : (
            '🚀 Executar Análise Ultimate v3.0'
          )}
        </button>
        {resultado && (
          <button onClick={exportarPDF} className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition border border-slate-700 text-cyan-300">
            📄 Exportar PDF
          </button>
        )}
      </div>

      {resultado && (
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 animate-fadeIn">
          <h3 className="text-lg font-semibold text-cyan-300">📊 Dashboard Analítico & Projeção Gráfica</h3>
          
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-2">Curva de Acumulação Patrimonial com Cripto & Juros Compostos</span>
            <canvas ref={canvasRef} width={600} height={180} className="w-full h-auto max-h-[180px] rounded"></canvas>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">🏖️ Simulador FIRE & Renda Passiva</h4>
              <p className="text-emerald-400 font-bold text-base">{formatarMoeda(resultado.rendaPassivaMensal)} / mês</p>
              <p className="text-xs text-slate-400">Rendimento passivo estimado (4% a.a.) sobre {formatarMoeda(resultado.monteCarlo.mediano)}.</p>
              <p className="text-xs text-cyan-400 pt-1">⏳ Prazo estimado para independência: <strong>{resultado.metasFire.anosNecessarios.toFixed(1)} anos</strong>.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 mb-1">🪙 Alocação com Hedge & Cripto</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Renda Fixa</span><span className="text-cyan-400">50%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-cyan-500 h-full" style={{ width: '50%' }}></div></div>
                
                <div className="flex justify-between pt-1"><span>Ações & Globais</span><span className="text-amber-400">{Math.max(0, 50 - resultado.alocacaoCripto)}%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: `${Math.max(0, 50 - resultado.alocacaoCripto)}%` }}></div></div>

                <div className="flex justify-between pt-1"><span>Cripto / Web3 Hedge</span><span className="text-emerald-400">{resultado.alocacaoCripto}%</span></div>
                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${resultado.alocacaoCripto}%` }}></div></div>
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
            <span className="font-bold text-slate-300">📊 Histórico Ultimate v3.0</span>
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
