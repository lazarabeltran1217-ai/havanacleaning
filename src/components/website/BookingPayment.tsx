"use client";

import { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { formatCurrency } from "@/lib/utils";

interface Props {
  bookingId: string;
  amount: number;
  returnUrl?: string;
  stripeKey: string;
}

function PaymentForm({ returnUrl }: { returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${returnUrl}`,
      },
    });

    if (submitError) {
      setError(submitError.message || "Payment failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-red text-[0.85rem] bg-red/10 border border-red/20 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green text-white py-4 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export function BookingPayment({ bookingId, amount, returnUrl = "/account/bookings", stripeKey }: Props) {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  const stripePromise = useMemo(() => loadStripe(stripeKey), [stripeKey]);

  useEffect(() => {
    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.alreadyPaid) {
          window.location.reload();
        } else if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Failed to initialize payment");
        }
      })
      .catch(() => setError("Failed to connect to payment service"));
  }, [bookingId]);

  if (error) {
    return (
      <div className="bg-white border border-tobacco/10 rounded-lg p-6">
        <div className="text-red text-[0.9rem]">{error}</div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-white border border-tobacco/10 rounded-lg p-6">
        <div className="text-center text-sand py-8">
          Loading payment form...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-tobacco/10 rounded-lg p-6">
      <h2 className="font-display text-lg mb-4">Payment</h2>
      <p className="text-[0.85rem] text-sand mb-4">
        Total: <span className="text-green font-semibold">{formatCurrency(amount)}</span>
      </p>
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: { theme: "stripe" } }}
      >
        <PaymentForm returnUrl={returnUrl} />
      </Elements>
    </div>
  );
}
