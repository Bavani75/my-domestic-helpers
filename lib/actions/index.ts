'use server';
import { db, snapshot, save, remove } from '@/lib/data';
import { isDue, localDate } from '@/lib/domain';
import { revalidatePath } from 'next/cache';
const tables: Record<string, string> = { helper: 'helpers', schedule: 'duty_schedules', request: 'maintenance_requests', log: 'duty_logs' };
function text(f: FormData, key: string, required = false) { const v = String(f.get(key) || '').trim(); if (required && !v) throw new Error('Please fill in all required fields.'); if (v.length > 3000) throw new Error('Text is too long.'); return v || null; }
function choice(f: FormData, key: string, options: string[]) { const v = text(f, key, true)!; if (!options.includes(v)) throw new Error('Invalid ' + key); return v; }
export async function loadData() { return snapshot(); }
export async function mutate(form: FormData) {
  try {
    const kind = text(form, 'kind', true)!; const id = text(form, 'id') || undefined;
    if (!tables[kind]) throw new Error('Invalid action.');
    if (form.get('operation') === 'delete') { if (!id) throw new Error('Missing record.'); await remove(tables[kind], id); }
    else if (kind === 'helper') await save(tables[kind], { name: text(form, 'name', true), role: text(form, 'role'), phone: text(form, 'phone') }, id);
    else if (kind === 'schedule') {
      const frequency = choice(form, 'frequency', ['daily', 'weekly']);
      const day = frequency === 'weekly' ? choice(form, 'day_of_week', ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']) : null;
      await save(tables[kind], { title: text(form, 'title', true), description: text(form, 'description'), frequency, day_of_week: day, assigned_helper_id: text(form, 'assigned_helper_id'), active: form.get('active') === 'on' }, id);
    } else if (kind === 'log') {
      const scheduleId = text(form, 'duty_schedule_id', true)!;
      const { data: schedule, error } = await db().from('duty_schedules').select('*').eq('id', scheduleId).single();
      if (error || !schedule || !isDue(schedule, localDate())) throw new Error('This duty is not scheduled for today.');
      await save(tables[kind], { duty_schedule_id: scheduleId, helper_id: schedule.assigned_helper_id, log_date: localDate(), status: 'done', note: text(form, 'note'), photo_url: text(form, 'photo_url') });
    } else {
      const status = choice(form, 'status', ['reported','assigned','in-progress','done']);
      const helper = text(form, 'assigned_helper_id');
      if (status !== 'reported' && !helper) throw new Error('Assign a helper before progressing this request.');
      let resolved = null;
      if (id) {
        const { data: old, error } = await db().from('maintenance_requests').select('status,resolved_at').eq('id', id).single();
        if (error || !old) throw new Error('Request not found.');
        const allowed: Record<string, string[]> = { reported: ['reported','assigned'], assigned: ['assigned','in-progress'], 'in-progress': ['in-progress','done'], done: ['done'] };
        if (!allowed[old.status]?.includes(status)) throw new Error('Please progress one status at a time.');
        resolved = status === 'done' ? old.resolved_at || new Date().toISOString() : null;
      } else if (status !== 'reported') throw new Error('New requests start as reported.');
      await save(tables[kind], { title: text(form, 'title', true), description: text(form, 'description'), location: text(form, 'location'), priority: choice(form, 'priority', ['low','medium','high']), status, assigned_helper_id: helper, resolved_at: resolved }, id);
    }
    revalidatePath('/', 'layout'); return { ok: true, message: 'Saved successfully.' };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : 'Something went wrong. Please retry.' }; }
}
export async function photoUpload(form: FormData) {
  try {
    const type = text(form, 'type', true)!;
    if (!['image/jpeg','image/png','image/webp'].includes(type)) throw new Error('Choose a JPG, PNG or WebP photo under 5 MB.');
    const path = `${crypto.randomUUID()}.${type.split('/')[1]}`;
    const client = db();
    const { data, error } = await client.storage.from('duty-photos').createSignedUploadUrl(path);
    if (error) throw new Error('Photo upload failed. You can still log the duty without a photo.');
    return { ok: true, url: data.signedUrl, publicUrl: client.storage.from('duty-photos').getPublicUrl(path).data.publicUrl };
  } catch(e) { return { ok: false, message: e instanceof Error ? e.message : 'Photo upload failed.' }; }
}
