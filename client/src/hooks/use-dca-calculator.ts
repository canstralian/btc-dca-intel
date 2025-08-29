import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { calculateDCA, simulateDCA } from "@/lib/dca-engine";

export function useDCACalculator() {
  const [amount, setAmount] = useState(500);
  const [frequency, setFrequency] = useState("weekly");
  const [duration, setDuration] = useState(12);

  const calculation = useMutation({
    mutationFn: () => calculateDCA(amount, frequency, duration),
  });

  const calculate = () => {
    calculation.mutate();
  };

  return {
    amount,
    setAmount,
    frequency,
    setFrequency,
    duration,
    setDuration,
    calculation,
    calculate,
  };
}

export function useSimulation() {
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-15");
  const [amount, setAmount] = useState(1000);

  const simulation = useMutation({
    mutationFn: () => simulateDCA(startDate, endDate, amount),
  });

  const runSimulation = () => {
    simulation.mutate();
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    amount,
    setAmount,
    simulation,
    runSimulation,
  };
}
