import { useState } from 'react';
import type { BarbadosDayPlan } from '../types';

// DEMO MODE — restore for production:
// import { supabase } from '../lib/supabase';
// import type { Database } from '../types/database';
// (restore all Supabase calls in each function)

export const usePlans = () => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const savePlan   = async (_plan: BarbadosDayPlan) => null;
  const deletePlan = async (_planId: string) => {};
  const getUserPlans  = async (): Promise<BarbadosDayPlan[]> => [];
  const getPlanById   = async (_planId: string): Promise<BarbadosDayPlan | null> => null;

  return { loading, error, savePlan, deletePlan, getUserPlans, getPlanById };
};
