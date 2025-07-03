// supabase/functions/restore-image/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Replicate API config
const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');

// Supabase config
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }

  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const jwt = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { 
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const { imageUrl, original_filename, testMode } = body;
  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'No image URL provided' }), { 
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Create a signed URL for the image so Replicate can access it
  // Extract the path from the full URL (remove the base URL part)
  const urlParts = imageUrl.split('/storage/v1/object/public/restorations/');
  const imagePath = urlParts[1] || imageUrl.split('/').pop(); // fallback to filename
  
  console.log('🔍 DEBUG: Original imageUrl:', imageUrl);
  console.log('🔍 DEBUG: URL parts after split:', urlParts);
  console.log('🔍 DEBUG: Extracted image path:', imagePath);
  
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('restorations')
    .createSignedUrl(imagePath, 3600); // 1 hour expiry

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('🚨 Failed to create signed URL:', signedUrlError);
    console.error('🚨 SignedUrlData:', signedUrlData);
    console.error('🚨 Image path used:', imagePath);
    return new Response(JSON.stringify({ 
      error: 'Failed to create accessible image URL',
      details: signedUrlError?.message,
      imagePath: imagePath,
      originalUrl: imageUrl
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const accessibleImageUrl = signedUrlData.signedUrl;
  console.log('✅ Created signed URL for Replicate access:', accessibleImageUrl);

  // Check user credits
  const { data: creditRow, error: creditError } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', user.id)
    .single();
    
  if (creditError || !creditRow || creditRow.credits < 1) {
    return new Response(JSON.stringify({ error: 'Insufficient credits' }), { 
      status: 402,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  let replicateData;
  let shouldDeductCredit = false;
  
  // TEST MODE: Skip Replicate API call and simulate response
  if (testMode) {
    console.log('🧪 TEST MODE: Simulating Replicate API response');
    
    // Generate a fake prediction ID
    const fakeId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    replicateData = {
      id: fakeId,
      status: 'completed',
      input: { image: accessibleImageUrl, scale: 2 },
      created_at: new Date().toISOString()
    };
    
    // In test mode, immediately create completed restoration
    const testRestoredImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
    
    try {
      const { error: insertError } = await supabase.from('photo_restorations').insert({
        user_id: user.id,
        original_filename: original_filename || 'uploaded_image.jpg',
        original_image_url: accessibleImageUrl,
        restored_image_url: testRestoredImageUrl,
        status: 'completed',
        credits_used: 1,
        replicate_job_id: fakeId,
        completed_at: new Date().toISOString()
      });

      if (insertError) {
        console.error('Database insert error in test mode:', insertError);
        console.error('Error details:', JSON.stringify(insertError, null, 2));
        return new Response(JSON.stringify({ 
          error: 'Database error', 
          details: insertError.message,
          testMode: true 
        }), { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      shouldDeductCredit = true; // Only deduct credit if database insert succeeds
      console.log(`🧪 TEST MODE: Completed restoration for job ${fakeId} immediately`);
      
    } catch (testError) {
      console.error('Unexpected error in test mode:', testError);
      return new Response(JSON.stringify({ 
        error: 'Test mode error', 
        details: testError.message 
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
  } else {
    // PRODUCTION MODE: Call actual Replicate API
    console.log('🚀 PRODUCTION MODE: Calling Replicate API');
    
    if (!REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN is not set');
      return new Response(JSON.stringify({ 
        error: 'Replicate API configuration error', 
        details: 'API token not configured' 
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('API Token exists:', !!REPLICATE_API_TOKEN);
    console.log('API Token length:', REPLICATE_API_TOKEN?.length);
    console.log('API Token prefix:', REPLICATE_API_TOKEN?.substring(0, 6) + '...');
    
    const webhookUrl = `${SUPABASE_URL}/functions/v1/replicate-webhook`;
    console.log('Webhook URL:', webhookUrl);
    console.log('Accessible Image URL:', accessibleImageUrl);
    
    // Test if the image URL is accessible
    try {
      const imageTest = await fetch(accessibleImageUrl, { method: 'HEAD' });
      console.log('Image URL accessibility test:', imageTest.status, imageTest.statusText);
    } catch (imageError) {
      console.error('Image URL not accessible:', imageError);
    }
    
    // Use the correct API endpoint for model predictions
    // The newer API uses model owner/name format directly in the URL
    const requestBody = {
      input: { 
        input_image: accessibleImageUrl,
        prompt: "Restore this old damaged photo, fix scratches, enhance quality, and improve colors while maintaining the original appearance"
      },
      webhook: webhookUrl,
      webhook_events_filter: ["completed"]
    };
    
    console.log('🚀 Sending request to Replicate API:');
    console.log('🚀 Request URL: https://api.replicate.com/v1/predictions');
    console.log('🚀 Request body:', JSON.stringify(requestBody, null, 2));
    console.log('🚀 Authorization header length:', REPLICATE_API_TOKEN?.length);
    
    try {
      const replicateRes = await fetch('https://api.replicate.com/v1/models/flux-kontext-apps/restore-image/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      replicateData = await replicateRes.json();
      console.log('🔍 Replicate response status:', replicateRes.status);
      console.log('🔍 Replicate response headers:', Object.fromEntries(replicateRes.headers.entries()));
      console.log('🔍 Replicate response data:', JSON.stringify(replicateData, null, 2));
      
      if (!replicateRes.ok) {
        console.error('🚨 Replicate API error details:');
        console.error('🚨 Status:', replicateRes.status);
        console.error('🚨 Status Text:', replicateRes.statusText);
        console.error('🚨 Response Data:', JSON.stringify(replicateData, null, 2));
        
        // Log the specific error fields that Replicate might return
        if (replicateData.detail) {
          console.error('🚨 Replicate Error Detail:', replicateData.detail);
        }
        if (replicateData.error) {
          console.error('🚨 Replicate Error Message:', replicateData.error);
        }
        
        return new Response(JSON.stringify({ 
          error: 'Replicate API error', 
          details: replicateData,
          status: replicateRes.status,
          statusText: replicateRes.statusText,
          replicateDetail: replicateData.detail || replicateData.error || 'No specific error detail provided'
        }), { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (fetchError) {
      console.error('Network error calling Replicate API:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Network error', 
        details: fetchError.message 
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Store restoration job for production
    const { error: insertError } = await supabase.from('photo_restorations').insert({
      user_id: user.id,
      original_filename: original_filename || 'uploaded_image.jpg',
      original_image_url: accessibleImageUrl,
      restored_image_url: null,
      status: 'processing',
      credits_used: 1,
      replicate_job_id: replicateData.id
    });

    if (insertError) {
      console.error('Database insert error in production mode:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      return new Response(JSON.stringify({ 
        error: 'Database error', 
        details: insertError.message,
        testMode: false 
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    shouldDeductCredit = true; // Only deduct credit if database insert succeeds
  }

  // Only deduct credit if restoration job was successfully created
  if (shouldDeductCredit) {
    await supabase
      .from('user_credits')
      .update({ credits: creditRow.credits - 1 })
      .eq('user_id', user.id);
  }

  // Return job info
  return new Response(JSON.stringify({ 
    success: true,
    prediction_id: replicateData.id,
    status: testMode ? 'completed' : replicateData.status,
    test_mode: testMode || false
  }), { 
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}); 