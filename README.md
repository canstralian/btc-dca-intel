
---

### **Project Overview**
- **Name:** `btc-dca-trading-system` (DCAlytics)
- **Purpose:** A cryptocurrency dashboard and simulation tool for dynamic dollar-cost averaging (DCA) combined with risk-managed hedging strategies.
- **Features:**
  - Portfolio visualization.
  - Simulation of BTC trades.
  - Comparison of DCA vs. HODL strategies.
  - Backtesting with historical and live BTC data.
  - Secure API endpoints with validation and authentication.
  - Responsive UI (React or Streamlit).

---

### **Stack Details**
- **Backend:** Python (FastAPI or Flask).
- **Frontend:** React (or optional static HTML/Streamlit).
- **Database:** PostgreSQL (recommended for production).
- **Other Dependencies:** Node.js (for frontend), Git.

---

### **Installation**
#### **Backend Setup**
1. Clone the repository.
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   ```
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Launch the FastAPI server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

#### **Frontend Setup**
- **React App:**
  ```bash
  cd frontend
  npm install
  npm start
  ```
- **Static HTML (Quick Option):**
  Open the file `frontend/index.html` manually in the browser.
- **Streamlit App:**
  ```bash
  pip install streamlit
  streamlit run frontend/app.py
  ```

---

### **Security Recommendations**
- Store secrets (e.g., API keys, database URLs) in environment variables.
- Use HTTPS in production.
- Rate-limit API requests to prevent abuse.
- Rotate API keys regularly.

---

### **API Example**
**FastAPI Simulation Endpoint:**
- **Route:** `/api/simulate`
- **Method:** `POST`
- **Request:**
  ```json
  {
    "investment_amount": 100.0,
    "frequency": "monthly",
    "hedge_pct": 20,
    "period_months": 12
  }
  ```
- **Headers:**
  `x-api-key` (for authentication).

Example code demonstrates the use of FastAPI with `pydantic` for validation and `os.getenv` for secure key management.

---

### **Frontend Example**
The React component `SimulationButton` fetches simulation results from the FastAPI backend. Key highlights:
- Uses `useState` for managing loading state and results.
- Sends a `POST` request to the `/api/simulate` endpoint with headers and a JSON body.
- Displays the results in a `<pre>` block.

---

### **Development Workflow**
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit changes and push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
4. Open a pull request.

---

### **Configuration**
- Use a `.env` file for sensitive configurations:
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/dcalytics
  API_KEY=your-secure-api-key-here
  BTC_API_URL=https://api.coingecko.com/api/v3
  ```
- Ensure the `.env` file is excluded from version control.

---

### **Project Structure**
The directory layout is clean and modular:
```
btc-dca-trading-system/
├── backend/               # Backend code
├── frontend/              # React or Streamlit frontend
├── data/                  # Sample datasets
├── docs/                  # Documentation
└── tests/                 # Unit tests
```

---

### **Licensing**
Licensed under the Apache License 2.0, ensuring open collaboration while maintaining clear guidelines for usage.

---
