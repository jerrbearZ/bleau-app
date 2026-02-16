import { NextResponse } from "next/server";

// Stripe checkout session creation
// To activate: add STRIPE_SECRET_KEY and STRIPE_PRICE_PRO / STRIPE_PRICE_CREDITS env vars
export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payments coming soon! We're setting up Stripe." },
        { status: 503 }
      );
    }

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRICE_PRO
        : process.env.STRIPE_PRICE_CREDITS;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured" },
        { status: 500 }
      );
    }

    const mode = plan === "pro" ? "subscription" : "payment";

    // Create Stripe checkout session
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://bleau.ai"}/pricing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://bleau.ai"}/pricing?canceled=true`,
        ...(plan === "credits" && {
          "payment_intent_data[metadata][type]": "credits",
          "payment_intent_data[metadata][amount]": "10",
        }),
      }),
    });

    const session = await response.json();

    if (session.error) {
      console.error("Stripe error:", session.error);
      return NextResponse.json(
        { error: "Payment error. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
