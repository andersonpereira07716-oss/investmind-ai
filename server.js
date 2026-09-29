import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeInvestmentProfile } from './agentCore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
