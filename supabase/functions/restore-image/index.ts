// supabase/functions/restore-image/index.ts
import { serve } from 'std/server';
import { createClient } from 'supabase';
import nsfw from 'nsfwjs';

// Replicate API config
const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
const REPLICATE_MODEL_VERSION = 'flux-kontext-apps/restore-image';

// Supabase config
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const jwt = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Parse request body
  const { imageBase64, original_filename } = await req.json();
  if (!imageBase64) {
    return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400 });
  }

  // NSFW filtering
  const imageBuffer = Uint8Array.from(atob(imageBase64.split(',')[1] || imageBase64), c => c.charCodeAt(0));
  const nsfwModel = await nsfw.load();
  const imageTensor = nsfw.image.decodeJpeg(imageBuffer);
  const predictions = await nsfwModel.classify(imageTensor);
  imageTensor.dispose();
  const nsfwScore = predictions.find(p => p.className === 'Hentai' || p.className === 'Porn' || p.className === 'Sexy')?.probability || 0;
  if (nsfwScore > 0.2) {
    return new Response(JSON.stringify({ error: 'NSFW image detected' }), { status: 400 });
  }

  // Check user credits
  const { data: creditRow, error: creditError } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', user.id)
    .single();
  if (creditError || !creditRow || creditRow.credits < 1) {
    return new Response(JSON.stringify({ error: 'Insufficient credits' }), { status: 402 });
  }

  // Call Replicate API
  const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: REPLICATE_MODEL_VERSION,
      input: { image: imageBase64 },
    }),
  });
  const replicateData = await replicateRes.json();
  if (!replicateRes.ok) {
    return new Response(JSON.stringify({ error: 'Replicate API error', details: replicateData }), { status: 500 });
  }

  // Deduct a credit
  await supabase
    .from('user_credits')
    .update({ credits: creditRow.credits - 1 })
    .eq('user_id', user.id);

  // Store restoration job
  await supabase.from('photo_restorations').insert({
    user_id: user.id,
    original_filename,
    original_image_url: null, // You may want to upload to storage and save the URL
    restored_image_url: null, // Will be updated when job completes
    status: 'processing',
    credits_used: 1,
  });

  // Return Replicate job info
  return new Response(JSON.stringify({ prediction: replicateData }), { status: 200 });
}); 