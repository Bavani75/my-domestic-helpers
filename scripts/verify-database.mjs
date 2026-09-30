// Read-only provisioning check. No keys or database rows are printed.
import { createClient } from '@supabase/supabase-js';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if(!url||!key) throw new Error('Pull .env.local from the linked Vercel project first.');
const client=createClient(url,key,{auth:{persistSession:false}});
const columns={helpers:'id,name,role,phone,photo_url',duty_schedules:'id,title,description,frequency,day_of_week,assigned_helper_id,active',duty_logs:'id,duty_schedule_id,helper_id,log_date,status,photo_url,note,created_at',maintenance_requests:'id,title,description,location,priority,status,assigned_helper_id,resolved_at',audit_logs:'id,action,target_type,target_id,details,created_at'};
let failed=false;
for(const [table,select] of Object.entries(columns)) {
 const {error,count}=await client.from(table).select(select,{count:'exact',head:true});
 if(error){console.error(table+': unavailable ('+error.code+'). Check migrations.');failed=true;}
 else console.log(table+': ready ('+count+' rows)');
}
const {data:schedules,error}=await client.from('duty_schedules').select('id').eq('frequency','weekly').is('day_of_week',null);
if(error||schedules?.length){console.error('Weekly schedules: missing weekday or unavailable.');failed=true;}
const {error:uploadError}=await client.storage.from('duty-photos').createSignedUploadUrl('provisioning-check.png');
if(uploadError){console.error('Photo bucket: signing unavailable. Apply migration 0002.');failed=true;}else console.log('Photo bucket: signed uploads ready (no file uploaded)');
if(failed)process.exitCode=1;
