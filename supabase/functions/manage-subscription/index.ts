
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for debugging logs
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANAGE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Error: No authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the JWT token from the authorization header
    const token = authHeader.replace("Bearer ", "");
    
    // Get the user from the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      logStep("Error: Invalid user token", { error: userError });
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    logStep("Authenticated user", { userId: user.id, email: user.email });

    // Get Stripe key from environment
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Error: Missing Stripe secret key");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Stripe key" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      logStep("Parsed request body", requestBody);
    } catch (e) {
      logStep("Error parsing request body", { error: e.message });
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { action } = requestBody;
    if (!action) {
      logStep("Error: Missing action parameter");
      return new Response(
        JSON.stringify({ error: "Missing action parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get the user's subscription
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError) {
      logStep("Error retrieving subscription", { error: subscriptionError });
      return new Response(
        JSON.stringify({ error: "Could not retrieve subscription information" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { stripe_subscription_id, stripe_customer_id } = subscriptionData;
    if (!stripe_subscription_id) {
      logStep("No active subscription found");
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    try {
      let result;
      if (action === 'cancel') {
        logStep("Cancelling subscription", { subscriptionId: stripe_subscription_id });
        result = await stripe.subscriptions.update(
          stripe_subscription_id,
          { cancel_at_period_end: true }
        );
        
        // Update the local record
        await supabaseClient
          .from("subscriptions")
          .update({ 
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
          
        logStep("Subscription marked for cancellation");
      } 
      else if (action === 'reactivate') {
        logStep("Reactivating subscription", { subscriptionId: stripe_subscription_id });
        result = await stripe.subscriptions.update(
          stripe_subscription_id,
          { cancel_at_period_end: false }
        );
        
        // Update the local record
        await supabaseClient
          .from("subscriptions")
          .update({ 
            cancel_at_period_end: false,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
          
        logStep("Subscription reactivated");
      }
      else {
        logStep("Invalid action requested", { action });
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: result }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      logStep("Error managing subscription", { 
        error: error.message,
        type: error.type,
        code: error.code
      });
      
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logStep("Unexpected error", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
