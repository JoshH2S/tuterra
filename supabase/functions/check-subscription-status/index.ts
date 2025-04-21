
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "./cors.ts";
import { getStripeSubscriptionData, updateSubscriptionStatus } from "./subscription-service.ts";

// Helper function for debugging logs
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) throw new Error("Invalid user token");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    let requestBody;
    try {
      requestBody = await req.json();
      logStep("Parsed request body", requestBody);
    } catch (e) {
      logStep("Error parsing request body", { error: e instanceof Error ? e.message : String(e) });
      throw new Error("Invalid request body");
    }

    const { sessionId } = requestBody;

    try {
      // Fetch current subscription data from database
      const { data: subscriptionData, error: dbError } = await supabaseAdmin
        .from("subscriptions")
        .select("stripe_customer_id, stripe_subscription_id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (dbError) {
        logStep("Database error fetching subscription", { error: dbError.message });
      }

      let stripeSubscriptionId = subscriptionData?.stripe_subscription_id;
      let stripeCustomerId = subscriptionData?.stripe_customer_id;

      // Get updated data from checkout session if available
      if (sessionId) {
        try {
          const checkoutData = await getStripeSubscriptionData(stripe, sessionId);
          if (checkoutData) {
            logStep("Retrieved data from checkout session", checkoutData);
            stripeCustomerId = checkoutData.stripe_customer_id;
            stripeSubscriptionId = checkoutData.stripe_subscription_id;
          }
        } catch (checkoutError) {
          logStep("Error retrieving checkout session", { 
            error: checkoutError instanceof Error ? checkoutError.message : String(checkoutError) 
          });
          // Continue with existing subscription data if we can't get new data
        }
      }

      // If we have a subscription ID, update the status
      if (stripeSubscriptionId && stripeCustomerId) {
        try {
          const result = await updateSubscriptionStatus(
            stripe,
            stripeSubscriptionId,
            stripeCustomerId,
            user.id,
            supabaseAdmin
          );
          
          logStep("Subscription status updated successfully", result);
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } catch (updateError) {
          logStep("Error updating subscription", { 
            error: updateError instanceof Error ? updateError.message : String(updateError)
          });
          // Continue to return a controlled response even if update fails
        }
      } else {
        logStep("No subscription data found to update");
      }

      // Return a controlled response even if we couldn't update
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Could not update subscription status",
        subscription_status: subscriptionData ? "unknown" : "none"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 to prevent client errors
      });
    } catch (processingError) {
      // Handle any unexpected errors during processing
      logStep("Error in subscription processing", { 
        error: processingError instanceof Error ? processingError.message : String(processingError)
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Error processing subscription information",
        error: processingError instanceof Error ? processingError.message : "Unknown error"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 to prevent client errors
      });
    }
  } catch (error) {
    // Handle any unexpected errors in the main try/catch
    logStep("Unexpected error", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Still return 200 to prevent client errors
    });
  }
});
