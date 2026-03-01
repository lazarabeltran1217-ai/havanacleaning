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
  onSuccess?: () => void;
}

function PaymentForm({ returnUrl, onSuccess }: { returnUrl: string; onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${returnUrl}`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "Payment failed");
      setLoading(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = `${returnUrl}?redirect_status=succeeded&payment_intent=${result.paymentIntent.id}`;
      }
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
        className="w-full bg-green text-white py-3.5 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-xl hover:bg-green/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export function BookingPayment({ bookingId, amount, returnUrl = "/account", stripeKey, onSuccess }: Props) {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const stripePromise = useMemo(() => loadStripe(stripeKey), [stripeKey]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.alreadyPaid) {
          setPaid(true);
        } else if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Failed to initialize payment");
        }
      })
      .catch(() => setError("Failed to connect to payment service"));
  }, [bookingId]);

  const CARD_CLS = "bg-white dark:bg-[#231c16] border border-gray-100 dark:border-[#3a2f25] rounded-xl p-5";
  const inline = !!onSuccess;

  if (paid) {
    return (
      <div className={inline ? "text-center py-4" : `${CARD_CLS} text-center py-8`}>
        <div className="text-green font-semibold text-[1rem] mb-3">Payment Already Completed!</div>
        <a href="/account" className="text-green hover:underline text-[0.9rem]">
          Back to Dashboard →
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className={inline ? "" : CARD_CLS}>
        <div className="text-red text-[0.9rem]">{error}</div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className={inline ? "text-center py-4" : `${CARD_CLS} text-center py-8`}>
        <div className="text-gray-400 dark:text-sand/70 text-sm">Loading payment form...</div>
      </div>
    );
  }

  const appearance = isDark
    ? {
        theme: "night" as const,
        variables: {
          colorPrimary: "#2D6A4F",
          colorBackground: "#1a1410",
          colorText: "#f5f0e8",
          colorTextSecondary: "#a89279",
          borderRadius: "8px",
        },
      }
    : { theme: "stripe" as const };

  return (
    <div className={inline ? "" : CARD_CLS}>
      {!inline && (
        <>
          <h2 className="font-display text-lg mb-4 text-tobacco dark:text-cream">Payment</h2>
          <p className="text-[0.85rem] text-sand dark:text-sand/70 mb-4">
            Total: <span className="text-green font-semibold">{formatCurrency(amount)}</span>
          </p>
        </>
      )}
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance }}
      >
        <PaymentForm returnUrl={returnUrl} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}
