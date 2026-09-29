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
  const [resultado, setResultado] = useState<any>(null);

  const executarAnaliseElite = () => {
    const estado = {
      capitalInicial: capital,
      aporteMensal: aporte,
      instituicao: "Banco do Brasil",
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

    setResultado({ monteCarlo, alocacao, metasFire, rebalanceamento, alertas });
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-cyan-400">InvestMind AI - Módulo Elite</h2>
        <p className="text-sm text-slate-400">Simulações avançadas de Monte Carlo, Alocação Global e Metas FIRE</p>
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

      <button onClick={executarAnaliseElite} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl transition shadow-lg shadow-cyan-900/30">
        Executar Análise Completa de Elite
      </button>

      {resultado && (
        <div className="space-y-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
          <h3 className="text-lg font-semibold text-cyan-300">📊 Relatório Estratégico Gerado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <h4 className="font-bold text-slate-300 mb-2">Simulação Monte Carlo (20 anos)</h4>
              <p>🟢 Otimista (P90): R$ {resultado.monteCarlo.otimista.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p>🟡 Mediano (P50): R$ {resultado.monteCarlo.mediano.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p>🔴 Pessimista (P10): R$ {resultado.monteCarlo.pessimista.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p className="mt-2 text-cyan-400 font-bold">Chance de Sucesso: {resultado.monteCarlo.chanceSucesso.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <h4 className="font-bold text-slate-300 mb-2">Metas FIRE</h4>
              <p>🌱 Lean FIRE: R$ {resultado.metasFire.leanFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p>⭐ Regular FIRE: R$ {resultado.metasFire.regularFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
              <p>👑 Fat FIRE: R$ {resultado.metasFire.fatFire.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
