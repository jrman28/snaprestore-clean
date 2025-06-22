import { serve } from 'std/server';
import { createClient } from 'supabase';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Replicate sends the job ID and output in the payload
  const { id: replicateJobId, output, status } = payload;
  if (!replicateJobId) {
    return new Response('Missing job ID', { status: 400 });
  }

  // Find the restoration by Replicate job ID and update it
  const { error } = await supabase
    .from('photo_restorations')
    .update({
      status: status || 'completed',
      restored_image_url: Array.isArray(output) ? output[0] : output,
      completed_at: new Date().toISOString(),
    })
    .eq('replicate_job_id', replicateJobId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response('Webhook received and processed', { status: 200 });
}); 