import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    // TODO: Get customerId from authenticated user session
    const customerId = "cus_placeholder";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal session error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
