/* ─────────────────────────────────────────────────────────
   PayScale Intelligence — tipos do banco de dados Supabase
   Gerado manualmente a partir de supabase/schema.sql
───────────────────────────────────────────────────────── */

export interface Profile {
  id: string;
  full_name: string | null;
  company: string | null;
  person_type: string;
  segment: string | null;
  avatar_url: string | null;
  plan: string;
  trial_ends: string;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  status: "connected" | "disconnected" | "error";
  last_sync: string | null;
  access_token: string | null;
  refresh_token: string | null;
  client_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  integration_id: string | null;
  provider: string;
  external_id: string;
  date: string;
  amount: number;
  mdr_rate: number | null;
  mdr_charged: number | null;
  net_amount: number | null;
  modality: string | null;
  /** pending | settled | divergent | no_settlement */
  status: string;
  customer_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Chargeback {
  id: string;
  user_id: string;
  integration_id: string | null;
  transaction_id: string | null;
  provider: string;
  external_id: string | null;
  customer_name: string | null;
  reason: string | null;
  amount: number;
  deadline_days: number | null;
  /** aberto | contestado | ganho | perdido */
  status: string;
  opened_at: string | null;
  resolved_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  /** mdr_deviation | no_settlement | chargeback_deadline | etc */
  type: string;
  /** info | warning | critical */
  severity: string;
  title: string;
  description: string | null;
  amount: number | null;
  resolved: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}
