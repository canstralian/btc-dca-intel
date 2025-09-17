# btc-dca-trading-system

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![Open Issues](https://img.shields.io/github/issues/canstralian/btc-dca-trading-system)](https://github.com/canstralian/btc-dca-trading-system/issues)

## Smart, hedged BTC investing made simple.

---

Table of Contents
1. [Introduction](#introduction)
2. [Quick Actions (Working Buttons)](#quick-actions-working-buttons)
3. [Features](#features)
4. [Installation](#installation)
5. [Working Button: Frontend & Backend Examples](#working-button-frontend--backend-examples)
6. [Collaboration & Contribution Enhancements](#collaboration--contribution-enhancements)
7. [Project Structure](#project-structure)
8. [Configuration](#configuration)
9. [Contributing](#contributing)
10. [License](#license)

---

## Introduction

DCAlytics is an interactive cryptocurrency dashboard and simulation tool combining dynamic dollar-cost averaging (DCA) with risk-managed hedging strategies. The platform allows users to:

- Visualize portfolio performance
- Simulate BTC trades
- Optimize investments while managing market volatility

Built with a responsive frontend and a Python backend, the stack is friendly to React + Flask/FastAPI and PostgreSQL for durable state.

---

## Quick Actions (Working Buttons)

Add this once near the top of your README (or to a docs page) to present interactive GitHub buttons:

These make it trivial for visitors to star, fork, open issues, or sponsor.

---

## Features

- Dynamic DCA engine with configurable intervals
- Hedging strategy support (adjustable hedge percentage)
- Portfolio analytics and comparisons (DCA vs HODL)
- Backtest engine using historical and live BTC data
- Responsive UI (TailwindCSS + Chart.js or React + Chart.js)
- Example endpoints for secure simulation runs and integration

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (optional but recommended for production; SQLite for quick local runs)
- Git

### Clone the Repository

```bash
git clone https://github.com/canstralian/btc-dca-trading-system.git
cd btc-dca-trading-system
```

### Backend (example using virtualenv)

```bash
python -m venv venv
source venv/bin/activate  # Linux / macOS
venv\Scripts\activate     # Windows

pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

(If you prefer Flask see the "Backend: Flask example" section below.)

### Frontend

- Static: open `frontend/index.html`
- React: `cd frontend && npm install && npm start`
- Streamlit: `pip install streamlit && streamlit run frontend/app.py`

---

## Working Button: Frontend & Backend Examples

Below are secure, working examples you can paste into the repo to wire a "Run Simulation" button to a backend endpoint. These examples include input validation, API-key checks, and notes on production hardening (rate limiting, job queueing, HTTPS).

A. Static HTML + JavaScript (frontend/scripts.js or index.html)
```html
<!-- Minimal accessible Run Simulation button + fetch to /api/simulate -->
<button id="runSimBtn" aria-label="Run simulation">Run Simulation</button>
<div id="simResult" aria-live="polite"></div>

<script>
/*
  Minimal client-side runner for demo purposes.
  - Disables button while request is in-flight.
  - Displays structured messages.
  - Do not rely on client-side validation alone.
*/
const runBtn = document.getElementById('runSimBtn');
const resultNode = document.getElementById('simResult');

runBtn.addEventListener('click', async () => {
  runBtn.disabled = true;
  runBtn.textContent = 'Running...';
  resultNode.textContent = '';

  const payload = {
    investment_amount: 50,
    frequency: 'weekly',
    hedge_pct: 20,
    period_months: 12
  };

  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use a rotated API key in production (e.g., via env + secrets manager)
        'x-api-key': 'REPLACE_WITH_SECURE_KEY'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || res.statusText);
    }

    const data = await res.json();
    resultNode.textContent = `Simulation complete — final_value: ${data.final_value}`;
  } catch (err) {
    resultNode.textContent = `Error: ${err.message}`;
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = 'Run Simulation';
  }
});
</script>
```

B. React (frontend/src/components/RunSimulation.jsx)
```jsx
import React, { useState } from 'react';

/**
 * RunSimulation - React component that triggers a simulation run.
 * - Uses fetch() to call the backend.
 * - Displays success/error messages and disables while running.
 */
export default function RunSimulation() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  async function handleRun() {
    setMessage('');
    setRunning(true);

    const payload = {
      investment_amount: 50,
      frequency: 'weekly',
      hedge_pct: 20,
      period_months: 12
    };

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // For production, obtain API keys via a secure endpoint or user auth
          'x-api-key': process.env.REACT_APP_API_KEY // Example for Create React App
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Request failed');
      }

      const data = await res.json();
      setMessage(`Success — final value: ${data.final_value}`);
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <button onClick={handleRun} disabled={running}>
        {running ? 'Running...' : 'Run Simulation'}
      </button>
      {message && <div role="status">{message}</div>}
    </div>
  );
}
```

C. FastAPI backend (backend/main.py) — secure and Pydantic-validated
```python
from fastapi import FastAPI, Header, HTTPException, Request, status
from pydantic import BaseModel, Field, conint, confloat
from typing import Optional

app = FastAPI(title="DCAlytics API")


class SimPayload(BaseModel):
    investment_amount: confloat(gt=0) = Field(..., description="USD per DCA purchase")
    frequency: str = Field(..., description="dca frequency: daily|weekly|monthly")
    hedge_pct: conint(ge=0, le=100) = Field(..., description="Hedge percentage (0-100)")
    period_months: conint(gt=0, le=120) = Field(..., description="Period in months")


@app.post("/api/simulate")
async def simulate(payload: SimPayload, x_api_key: Optional[str] = Header(None)):
    """
    Run a lightweight simulation and return summary results.
    Security:
      - Simple API key required (replace with OAuth2/JWT for production).
      - Keep handler short; for long simulations push to a background queue (Celery/RQ).
    """
    if x_api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")

    # Toy simulation - replace with the real trading_engine logic
    multiplier = 1.1 - (payload.hedge_pct / 100) * 0.01
    final_value = payload.investment_amount * payload.period_months * multiplier

    return {"final_value": round(final_value, 2), "period_months": payload.period_months}
```

D. Flask alternative (backend/flask_app.py) — for teams preferring Flask
```python
"""
Flask endpoint equivalent. Use with gunicorn + uvloop for production.
This example uses pydantic for request validation.
"""
from flask import Flask, request, jsonify
from pydantic import BaseModel, ValidationError, conint, confloat

app = Flask(__name__)


class SimPayload(BaseModel):
    investment_amount: confloat(gt=0)
    frequency: str
    hedge_pct: conint(ge=0, le=100)
    period_months: conint(gt=1, le=120)


@app.route("/api/simulate", methods=["POST"])
def simulate():
    api_key = request.headers.get("x-api-key")
    if api_key != "REPLACE_WITH_SECURE_KEY":
        return jsonify({"detail": "Invalid API key"}), 401

    try:
        payload = SimPayload(**request.get_json())
    except ValidationError as exc:
        return jsonify({"detail": exc.errors()}), 422

    multiplier = 1.1 - (payload.hedge_pct / 100) * 0.01
    final_value = payload.investment_amount * payload.period_months * multiplier
    return jsonify({"final_value": round(final_value, 2), "period_months": payload.period_months})
```

Notes and production hardening:
- Use HTTPS only.
- Replace static API key with OAuth2/JWT or session-based auth.
- Add rate limiting (Redis + limiter middleware) and request logging.
- For long simulations use background processing (Celery/RQ + Redis) and return a job ID.
- Sanitize inputs and limit maximum work per request (protect CPU/time).

---

## Collaboration & Contribution Enhancements

To attract contributors and streamline triage, add these repository files (I can create them for you if you want):

- CONTRIBUTING.md — contribution workflow, local dev steps, testing, commit message guidance.
- CODE_OF_CONDUCT.md — Contributor Covenant (short version + contact).
- .github/ISSUE_TEMPLATE/bug_report.md — structured bug report.
- .github/ISSUE_TEMPLATE/feature_request.md — fielded feature request.
- .github/PULL_REQUEST_TEMPLATE.md — PR checklist (tests, changelog, "assign me" option).
- .github/workflows/ci.yml — CI to run unit tests and linters on PRs (example below).
- LABELS.md — recommended label set and descriptions.
- CONTRIBUTORS.md — add contributors (and instructions on how to add yourself).

Example CI (GitHub Actions) snippet: .github/workflows/ci.yml
```yaml
name: CI
on:
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install backend deps
        run: |
          python -m pip install --upgrade pip
          pip install -r backend/requirements.txt
      - name: Run linters
        run: |
          pip install flake8
          flake8 backend
      - name: Run tests
        run: |
          pip install pytest
          pytest -q
```

Good-first-issue ideas (add as issues to the repo to attract contributors):
- "Add unit tests for trading_engine buy/sell calculations" — label: good first issue
- "Implement API key rotation utility and docs" — label: help wanted
- "Add Streamlit demo page with example simulation" — label: enhancement
- "Add CONTRIBUTING.md and CODE_OF_CONDUCT.md" — label: docs

Encouraging collaboration:
- Pin a few "good first issue" tasks.
- Add a CONTRIBUTOR WELCOME blurb in README with steps to get started.
- Offer a "mentor available" checkbox in PR template for maintainers to volunteer.

---

## Project Structure

```
btc-dca-trading-system/
├── backend/                 # FastAPI or Flask backend
│   ├── main.py              # API routes (FastAPI example)
│   ├── flask_app.py         # Flask alternative
│   ├── trading_engine.py    # Algorithmic trading logic
│   ├── models.py            # Pydantic / DB models
│   └── requirements.txt
├── frontend/                # Dashboard UI (static/React/Streamlit)
│   ├── index.html
│   ├── src/                 # React app
│   └── app.py               # Streamlit app
├── data/                    # Sample datasets / cached BTC prices
├── docs/                    # Documentation and diagrams
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
└── README.md
```

---

## Configuration

- Use environment variables or a secrets manager (HashiCorp Vault, AWS Secrets Manager) for API keys and DB credentials.
- Example .env (not to be committed):
```
DATABASE_URL=postgres://user:pass@localhost:5432/dcalytics
API_KEY=your_securely_generated_api_key_here
```
- Recommend PostgreSQL for production, use SQLAlchemy (or async SQLModel) and connection pooling.

Security best practices (short list):
- Do not commit secrets.
- Use parameterized queries with SQLAlchemy/psycopg2.
- Apply rate-limiting and authentication for endpoints.
- Use HTTPS and HSTS on production.

---

## Contributing

We welcome contributions. Quickstart:

1. Fork the repo.
2. Create branch: feature/<short-desc> or fix/<short-desc>.
3. Run tests and linters locally (see CONTRIBUTING.md).
4. Open a PR with a clear description and link to any issues.

Suggested templates and labels are mentioned above. If you're new, comment "I want to help" on a `good first issue` and a maintainer will guide you.

---

## License

Apache 2.0 — see LICENSE for details.

---
