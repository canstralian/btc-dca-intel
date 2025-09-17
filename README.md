btc-dca-trading-system (DCAlytics)

https://img.shields.io/badge/license-Apache%202.0-blue.svg https://img.shields.io/badge/python-3.11%2B-blue https://img.shields.io/github/issues/canstralian/btc-dca-trading-system https://img.shields.io/github/stars/canstralian/btc-dca-trading-system?style=social https://img.shields.io/github/forks/canstralian/btc-dca-trading-system?style=social

Smart, hedged BTC investing made simple.

---

Table of Contents

1. Introduction
2. Quick Actions
3. Features
4. Installation
5. API Examples
6. Collaboration
7. Project Structure
8. Configuration
9. Contributing
10. License

---

Introduction

DCAlytics is an interactive cryptocurrency dashboard and simulation tool combining dynamic dollar-cost averaging (DCA) with risk-managed hedging strategies. The platform allows users to:

· Visualize portfolio performance
· Simulate BTC trades
· Optimize investments while managing market volatility

Built with a responsive frontend and a Python backend, the stack is friendly to React + Flask/FastAPI and PostgreSQL for durable state.

---

Quick Actions

Quick links for repository interaction:

https://img.shields.io/badge/-Open%20Issue-blue?logo=github https://img.shields.io/badge/-Fork%20Repo-lightgrey?logo=github https://img.shields.io/badge/-Star%20Repo-yellow?logo=github

---

Features

· Dynamic DCA engine with configurable intervals
· Hedging strategy support (adjustable hedge percentage)
· Portfolio analytics and comparisons (DCA vs HODL)
· Backtest engine using historical and live BTC data
· Responsive UI (TailwindCSS + Chart.js or React + Chart.js)
· Secure API endpoints with validation and authentication

---

Installation

Prerequisites

· Python 3.11+
· Node.js 18+ (for React frontend)
· PostgreSQL (recommended for production)
· Git

Clone & Setup

```bash
git clone https://github.com/canstralian/btc-dca-trading-system.git
cd btc-dca-trading-system
```

Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate  # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Run FastAPI server
uvicorn backend.main:app --reload --port 8000
```

Frontend Setup

Choose one of the following frontend options:

Static HTML:

```bash
open frontend/index.html  # Or manually open in browser
```

React App:

```bash
cd frontend
npm install
npm start
```

Streamlit App:

```bash
pip install streamlit
streamlit run frontend/app.py
```

---

API Examples

FastAPI Backend (Recommended)

```python
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import os

app = FastAPI()

class SimulationRequest(BaseModel):
    investment_amount: float
    frequency: str
    hedge_pct: int
    period_months: int

@app.post("/api/simulate")
async def simulate(
    request: SimulationRequest,
    x_api_key: str = Header(...)
):
    if x_api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Your simulation logic here
    return {"status": "success", "data": request.dict()}
```

React Frontend Component

```jsx
import React, { useState } from 'react';

const SimulationButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY
        },
        body: JSON.stringify({
          investment_amount: 100,
          frequency: 'monthly',
          hedge_pct: 20,
          period_months: 12
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={runSimulation} disabled={loading}>
        {loading ? 'Running...' : 'Run Simulation'}
      </button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};
```

---

Collaboration

We welcome contributions! Please see our Contributing Guidelines for details.

Good First Issues

· Add unit tests for trading engine
· Implement API key rotation utility
· Enhance Streamlit dashboard
· Improve documentation

Development Setup

1. Fork the repository
2. Create a feature branch: git checkout -b feature/amazing-feature
3. Commit changes: git commit -m 'Add amazing feature'
4. Push to branch: git push origin feature/amazing-feature
5. Open a Pull Request

---

Project Structure

```
btc-dca-trading-system/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── trading_engine.py    # Core trading logic
│   ├── models.py            # Data models
│   └── requirements.txt
├── frontend/
│   ├── public/              # Static files
│   ├── src/                 # React components
│   ├── app.py               # Streamlit app
│   └── package.json
├── data/                    # Sample data
├── docs/                    # Documentation
└── tests/                   # Test cases
```

---

Configuration

1. Copy .env.example to .env
2. Update environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dcalytics
API_KEY=your-secure-api-key-here
BTC_API_URL=https://api.coingecko.com/api/v3
```

Security Recommendations:

· Use environment variables for all secrets
· Enable HTTPS in production
· Implement rate limiting
· Regularly rotate API keys

---

Contributing

1. Read our Code of Conduct
2. Follow GitHub Flow
3. Write tests for new features
4. Update documentation accordingly
5. Ensure all tests pass before submitting PR

---

License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

---

Note: This is a simulation tool only. Not financial advice. Cryptocurrency investments carry significant risk.
