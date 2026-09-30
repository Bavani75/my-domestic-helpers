import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { localDate, type Snapshot } from '@/lib/domain';
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Database configuration is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function snapshot(): Promise<Snapshot> {
  const client = db();
  const results = await Promise.all(['helpers', 'duty_schedules', 'duty_logs', 'maintenance_requests'].map(table => client.from(table).select('*').order('created_at', { ascending: false })));
  if (results.some(r => r.error)) throw new Error("Couldn't load data. Check connection and retry.");
  return { helpers: results[0].data!, schedules: results[1].data!, logs: results[2].data!, requests: results[3].data!, today: localDate() } as Snapshot;
}
export async function save(table: string, values: Record<string, unknown>, id?: string) {
  const query = id ? db().from(table).update(values).eq('id', id) : db().from(table).insert(values);
  const { data, error } = await query.select().single();
  if (error) throw new Error(error.code === '23505' ? 'Already logged for today.' : 'Could not save. Please retry.');
  return data;
}
export async function remove(table: string, id: string) {
  const { error } = await db().from(table).delete().eq('id', id);
  if (error) throw new Error('Could not delete. Please retry.');
}
