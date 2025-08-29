export interface DCACalculation {
  totalInvestment: number;
  projectedValue: number;
  potentialReturn: number;
  totalPurchases: number;
  avgPurchaseAmount: number;
}

export interface SimulationResult {
  totalReturn: number;
  finalValue: number;
  totalInvested: number;
  bestEntry: number;
  worstEntry: number;
  avgEntry: number;
  vs_lump_sum: number;
  vs_buy_hold: number;
}

export const calculateDCA = async (
  amount: number,
  frequency: string,
  duration: number
): Promise<DCACalculation> => {
  const response = await fetch('/api/calculate-dca', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, frequency, duration }),
  });

  if (!response.ok) {
    throw new Error('Failed to calculate DCA strategy');
  }

  return response.json();
};

export const simulateDCA = async (
  startDate: string,
  endDate: string,
  amount: number
): Promise<SimulationResult> => {
  const response = await fetch('/api/simulate-dca', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ startDate, endDate, amount }),
  });

  if (!response.ok) {
    throw new Error('Failed to run DCA simulation');
  }

  return response.json();
};
