export interface Transaction {
  id?: string;
  reference_id?: string;
  amount?: number;
  status?: string;
  type?: string;
  provider?: string;
  created_at?: string;
  [k: string]: any;
}

export interface User {
  id?: string;
  phone?: string;
  name?: string;
  token?: string;
}
