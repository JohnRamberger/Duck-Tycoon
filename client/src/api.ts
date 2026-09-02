// All game data access. Reads hit tables through RLS; writes go through
// Postgres functions (see database/supabase.sql) keyed off the caller's JWT.
import { supabase } from './supabase';

export type Stock = {
  id: number;
  name: string;
  tot_num_shares: number;
  market_price: number;
  shares_avail: number;
};

export type OwnedStock = {
  stockid: number;
  num_shares_owned: number;
  input_investment: number;
  stock: Stock;
};

export type UserRow = {
  userid: string;
  username: string;
  days_school_left: number | null;
  days_work_left: number | null;
  salary: number;
  net_worth_la: number;
};

export type StatsInfo = {
  p_new_net_worth: number;
  p_new_checking: number;
  p_new_savings: number;
  p_old_net_worth: number;
  p_old_checking: number;
  p_old_savings: number;
};

export type StockStatsInfo = {
  p_old_value: number | null;
  p_new_value: number | null;
};

const rpc = async <T = void>(
  fn: string,
  args?: Record<string, unknown>
): Promise<T> => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
};

const currentUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Not logged in');
  return data.user.id;
};

// ---- reads ---------------------------------------------------------------

export const getUser = async (): Promise<UserRow | null> => {
  const uid = await currentUserId();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('userid', uid)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as UserRow | null;
};

export const getStocks = async (): Promise<Stock[]> => {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .order('id');
  if (error) throw new Error(error.message);
  return (data ?? []) as Stock[];
};

export const getOwnedStocks = async (): Promise<OwnedStock[]> => {
  const { data, error } = await supabase
    .from('owned_shares')
    .select('stock_id, num_shares_owned, input_investment, stocks(*)')
    .order('stock_id');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    stockid: row.stock_id,
    num_shares_owned: row.num_shares_owned,
    input_investment: row.input_investment,
    stock: row.stocks as Stock,
  }));
};

export const getLeaderboard = async (): Promise<
  Pick<UserRow, 'username' | 'net_worth_la'>[]
> => {
  const { data, error } = await supabase
    .from('users')
    .select('username, net_worth_la')
    .order('net_worth_la', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
};

// ---- actions -------------------------------------------------------------

export const choosePath = (choice: 0 | 1) =>
  rpc('choose_path', { p_choice: choice });

export const transferCheckingToSavings = (amount: number) =>
  rpc('transfer_checking_to_savings', { p_amount: amount });

export const transferSavingsToChecking = (amount: number) =>
  rpc('transfer_savings_to_checking', { p_amount: amount });

export const buyStocks = (stockId: number, shares: number) =>
  rpc('buy_stocks', { p_stock_id: stockId, p_num_shares: shares });

export const sellStocks = (stockId: number, shares: number) =>
  rpc('sell_stocks', { p_stock_id: stockId, p_num_shares: shares });

export const work = () => rpc('work');

export const study = () => rpc('study');

export const playedGame = () => rpc('played_game');

export const updateStats = () => rpc<StatsInfo>('update_stats');

export const updateStockStats = (stockId: number) =>
  rpc<StockStatsInfo>('update_stock_stats', { p_stock_id: stockId });
