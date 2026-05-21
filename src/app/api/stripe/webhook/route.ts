/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Use a service-role client for webhook processing (no user session available)
function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Stripe webhook verification error: stripe-signature header is missing.");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook verification error: STRIPE_WEBHOOK_SECRET environment variable is not defined.");
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET env variable" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Stripe webhook verification error: Webhook signature verification failed.", err.message || err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabase();

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const customerId = session.customer as string;
      const plan = session.metadata?.plan || "free";

      if (userId && customerId) {
        // Link Stripe customer to user profile and activate subscription
        await supabase
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            subscription_status: plan,
          })
          .eq("id", userId);
      }

      console.log("Checkout completed:", session.id, "User:", userId, "Plan:", plan);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;

      // Reverse map the price ID to the local tier name (starter, pro, agency)
      const plan = priceId ? getPlanFromPriceId(priceId) : "free";

      await supabase
        .from("profiles")
        .update({ subscription_status: plan })
        .eq("stripe_customer_id", customerId);

      console.log("Subscription updated:", subscription.id, "Plan:", plan);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from("profiles")
        .update({ subscription_status: "free" })
        .eq("stripe_customer_id", customerId);

      console.log("Subscription cancelled:", subscription.id);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from("profiles")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", customerId);

      console.log("Payment failed:", invoice.id);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
