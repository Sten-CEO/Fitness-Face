// Supabase Edge Function for IAP Receipt Validation
// Validates Apple App Store and Google Play receipts server-side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  platform: 'ios' | 'android';
  receiptData: string;
  productId: string;
  userId: string;
}

interface ValidationResponse {
  isValid: boolean;
  expirationDate?: string;
  productId?: string;
  originalTransactionId?: string;
  error?: string;
}

// Apple App Store Server API endpoints
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// Google Play API endpoint
const GOOGLE_PLAY_API = 'https://androidpublisher.googleapis.com/androidpublisher/v3';

async function validateAppleReceipt(
  receiptData: string,
  _productId: string
): Promise<ValidationResponse> {
  const appSharedSecret = Deno.env.get('APPLE_SHARED_SECRET');

  if (!appSharedSecret) {
    console.error('APPLE_SHARED_SECRET not configured');
    return { isValid: false, error: 'Server configuration error' };
  }

  const requestBody = {
    'receipt-data': receiptData,
    password: appSharedSecret,
    'exclude-old-transactions': true,
  };

  try {
    // First try production
    let response = await fetch(APPLE_PRODUCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    let result = await response.json();

    // If sandbox receipt, retry with sandbox URL (status 21007)
    if (result.status === 21007) {
      response = await fetch(APPLE_SANDBOX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      result = await response.json();
    }

    // Status 0 means valid
    if (result.status !== 0) {
      console.error('Apple validation failed with status:', result.status);
      return {
        isValid: false,
        error: `Apple validation failed: status ${result.status}`,
      };
    }

    // Find the latest subscription info
    const latestReceipt = result.latest_receipt_info?.[0];
    if (!latestReceipt) {
      return { isValid: false, error: 'No subscription found in receipt' };
    }

    // Check if subscription is still valid
    const expiresDateMs = parseInt(latestReceipt.expires_date_ms, 10);
    const isValid = expiresDateMs > Date.now();

    return {
      isValid,
      expirationDate: new Date(expiresDateMs).toISOString(),
      productId: latestReceipt.product_id,
      originalTransactionId: latestReceipt.original_transaction_id,
    };
  } catch (error) {
    console.error('Apple validation error:', error);
    return { isValid: false, error: 'Apple validation request failed' };
  }
}

async function validateGoogleReceipt(
  receiptData: string,
  productId: string
): Promise<ValidationResponse> {
  const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
  const packageName = Deno.env.get('ANDROID_PACKAGE_NAME') || 'com.jaw.app';

  if (!serviceAccountKey) {
    console.error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
    return { isValid: false, error: 'Server configuration error' };
  }

  try {
    // Parse the receipt data (purchase token)
    let purchaseToken: string;
    try {
      const parsed = JSON.parse(receiptData);
      purchaseToken = parsed.purchaseToken || parsed.token || receiptData;
    } catch {
      purchaseToken = receiptData;
    }

    // Get access token from service account
    const serviceAccount = JSON.parse(serviceAccountKey);
    const accessToken = await getGoogleAccessToken(serviceAccount);

    if (!accessToken) {
      return { isValid: false, error: 'Failed to authenticate with Google' };
    }

    // Verify subscription with Google Play API
    const url = `${GOOGLE_PLAY_API}/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Play API error:', errorText);
      return { isValid: false, error: 'Google Play validation failed' };
    }

    const result = await response.json();

    // Check subscription state
    // paymentState: 0 = pending, 1 = received, 2 = free trial, 3 = pending deferred
    const isValid =
      result.expiryTimeMillis > Date.now() &&
      (result.paymentState === 1 || result.paymentState === 2);

    return {
      isValid,
      expirationDate: new Date(parseInt(result.expiryTimeMillis, 10)).toISOString(),
      productId: productId,
      originalTransactionId: result.orderId,
    };
  } catch (error) {
    console.error('Google validation error:', error);
    return { isValid: false, error: 'Google validation request failed' };
  }
}

async function getGoogleAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    // Create JWT (simplified - in production use a proper JWT library)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));

    // Note: Full RS256 signing would require crypto operations
    // For production, use a proper JWT library or Google's auth library
    // This is a simplified placeholder

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${encodedHeader}.${encodedPayload}.signature`,
      }),
    });

    if (!response.ok) {
      console.error('Failed to get Google access token');
      return null;
    }

    const result = await response.json();
    return result.access_token;
  } catch (error) {
    console.error('Google auth error:', error);
    return null;
  }
}

async function logValidation(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  platform: string,
  productId: string,
  isValid: boolean,
  transactionId?: string
) {
  try {
    await supabase.from('receipt_validations').insert({
      user_id: userId,
      platform,
      product_id: productId,
      is_valid: isValid,
      transaction_id: transactionId,
      validated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log validation:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { platform, receiptData, productId, userId }: ValidationRequest =
      await req.json();

    // Input validation
    if (!platform || !receiptData || !productId) {
      return new Response(
        JSON.stringify({
          isValid: false,
          error: 'Missing required fields: platform, receiptData, productId',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!['ios', 'android'].includes(platform)) {
      return new Response(
        JSON.stringify({
          isValid: false,
          error: 'Invalid platform. Must be ios or android',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let result: ValidationResponse;

    if (platform === 'ios') {
      result = await validateAppleReceipt(receiptData, productId);
    } else {
      result = await validateGoogleReceipt(receiptData, productId);
    }

    // Log the validation attempt
    if (userId) {
      await logValidation(
        supabaseClient,
        userId,
        platform,
        productId,
        result.isValid,
        result.originalTransactionId
      );
    }

    // Update user subscription if valid
    if (result.isValid && userId) {
      await supabaseClient.from('profiles').update({
        subscription_last_validated: new Date().toISOString(),
        subscription_expiration_date: result.expirationDate,
        subscription_original_transaction_id: result.originalTransactionId,
      }).eq('id', userId);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({
        isValid: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
