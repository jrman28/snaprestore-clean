import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req) => {
  // Add CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  console.log('🎣 Webhook received from Replicate');
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  let payload;
  try {
    payload = await req.json();
    console.log('📦 Webhook payload:', JSON.stringify(payload, null, 2));
  } catch (e) {
    console.error('❌ Invalid JSON in webhook:', e);
    return new Response('Invalid JSON', { 
      status: 400,
      headers: corsHeaders 
    });
  }

  // Replicate sends the job completion data
  const { id: jobId, output, status, error } = payload;
  
  if (!jobId) {
    console.error('❌ Missing job ID in webhook payload');
    return new Response('Missing job ID', { 
      status: 400,
      headers: corsHeaders 
    });
  }

  console.log(`🔄 Processing webhook for job ${jobId} with status: ${status}`);

  // Map Replicate status to our status
  let ourStatus;
  switch (status) {
    case 'succeeded':
      ourStatus = 'completed';
      break;
    case 'failed':
      ourStatus = 'failed';
      break;
    case 'canceled':
      ourStatus = 'failed';
      break;
    default:
      ourStatus = status; // processing, starting, etc.
  }

  // Update the photo restoration record
  const updateData: any = {
    status: ourStatus,
    completed_at: new Date().toISOString()
  };

  // If the job succeeded and has output, save the restored image URL
  if (status === 'succeeded' && output) {
    if (Array.isArray(output) && output.length > 0) {
      updateData.restored_image_url = output[0];
      console.log(`✅ Job ${jobId} succeeded with output: ${output[0]}`);
    } else if (typeof output === 'string') {
      updateData.restored_image_url = output;
      console.log(`✅ Job ${jobId} succeeded with output: ${output}`);
    }
  } else if (status === 'failed') {
    console.error(`❌ Job ${jobId} failed:`, error || 'No error details provided');
  }

  console.log('📝 Updating database with:', updateData);

  const { error: dbError } = await supabase
    .from('photo_restorations')
    .update(updateData)
    .eq('replicate_job_id', jobId);

  if (dbError) {
    console.error('💥 Database update error:', dbError);
    return new Response('Database error', { 
      status: 500,
      headers: corsHeaders 
    });
  }

  console.log(`🎉 Successfully updated job ${jobId} to status: ${ourStatus}`);

  return new Response('OK', { 
    status: 200,
    headers: corsHeaders 
  });
}); 