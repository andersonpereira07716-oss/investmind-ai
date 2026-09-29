import express from 'express';
import { analyzeInvestmentProfile } from './agentCore.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    name: 'InvestMind-AI API', 
    description: 'Agente de Inteligência Financeira e Robo-Advisor',
    endpoints: ['POST /api/analyze'] 
  });
});

app.post('/api/analyze', (req, res) => {
  try {
    const { capital, riskTolerance, monthlyContribution } = req.body;
    if (!capital || !riskTolerance) {
      return res.status(400).json({ error: 'Informe o capital inicial e o perfil de risco.' });
    }
    const report = analyzeInvestmentProfile(Number(capital), riskTolerance, Number(monthlyContribution || 0));
    res.json({ status: 'success', report });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`📈 InvestMind AI a rodar na porta ${PORT}`);
});
