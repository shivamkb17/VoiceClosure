import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { priceId, interval = "month" } = await req.json();

    if (!priceId || !PRICE_IDS[priceId]) {
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 }
      );
    }

    const stripePriceId = PRICE_IDS[priceId][interval];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
