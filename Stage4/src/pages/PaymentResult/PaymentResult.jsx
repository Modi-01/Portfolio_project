import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

// Landing page for the Moyasar callback redirect after 3-D Secure.
// Query params: status=success|failed|pending|error, subscription_id, message.
function PaymentResult() {
  const [params] = useSearchParams();
  const status = params.get("status") || "error";
  const subscriptionId = params.get("subscription_id");
  const message = params.get("message");

  const view = {
    success: {
      icon: "✅",
      title: "Payment Successful",
      desc: `Your weekly meal subscription${subscriptionId ? ` #${subscriptionId}` : ""} is confirmed. Your meals will be delivered Sunday to Thursday.`,
      cta: { to: "/dashboard", label: "View My Dashboard" },
    },
    failed: {
      icon: "❌",
      title: "Payment Failed",
      desc: message || "Your card was declined. No amount was charged.",
      cta: { to: "/restaurants", label: "Try Again" },
    },
    pending: {
      icon: "⏳",
      title: "Payment Pending",
      desc: "Your payment has not been completed yet. Check your dashboard shortly.",
      cta: { to: "/dashboard", label: "Go to Dashboard" },
    },
    error: {
      icon: "⚠️",
      title: "Something Went Wrong",
      desc: message || "We could not verify your payment. Contact support if you were charged.",
      cta: { to: "/dashboard", label: "Go to Dashboard" },
    },
  }[status] || {
    icon: "⚠️",
    title: "Unknown Payment Status",
    desc: "We could not determine the payment result.",
    cta: { to: "/dashboard", label: "Go to Dashboard" },
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .pres-body { background: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
        .pres-main { max-width: 560px; margin: 0 auto; padding: 80px 32px; text-align: center; }
        .pres-icon { font-size: 56px; margin-bottom: 16px; }
        .pres-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .pres-desc { font-size: 15px; color: #5e5e5b; margin-bottom: 32px; }
        .pres-cta { display: inline-block; background: #325f3f; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-size: 15px; font-weight: 600; }
        .pres-secondary { display: block; margin-top: 16px; color: #325f3f; font-size: 14px; font-weight: 600; text-decoration: none; }
      `}</style>

      <div className="pres-body">
        <Navbar />
        <main className="pres-main">
          <div className="pres-icon">{view.icon}</div>
          <h1 className="pres-title">{view.title}</h1>
          <p className="pres-desc">{view.desc}</p>
          <Link className="pres-cta" to={view.cta.to}>{view.cta.label}</Link>
          <Link className="pres-secondary" to="/">Back to Home</Link>
        </main>
      </div>
    </>
  );
}

export default PaymentResult;
