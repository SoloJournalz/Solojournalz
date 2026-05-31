import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";
import PublicHero from "@/app/components/public/public-hero";

const plans = [
  {
    name: "Free",
    price: "£0",
    period: "/month",
    description: "For traders starting with structured review.",
    features: [
      "30 trades per month",
      "Core trade journaling",
      "Basic analytics",
      "Screenshot support",
      "Lightweight customization",
    ],
  },
  {
    name: "Expert",
    price: "£23",
    period: "/month",
    description: "For traders who want deeper performance intelligence.",
    features: [
      "Unlimited trades",
      "Unlimited screenshots",
      "Environment Edge",
      "Performance Insights",
      "Consistency Intelligence",
      "Psychology Tracking",
      "Advanced analytics",
      "Unlimited customization",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[var(--background)] px-6 text-[var(--text-primary)] md:px-10">
        <PublicHero
          label="Prices"
          title="Simple pricing for disciplined traders."
          description="Start with the essentials or unlock the full performance intelligence layer with Expert. Pricing and features may change before launch."
        />

        <section className="mx-auto max-w-5xl pb-24">
          <div className="grid gap-6 lg:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="rounded-[1.75rem] border border-[var(--border)] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[var(--accent)]/25 hover:shadow-xl md:p-8"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black">{plan.name}</h2>
                    <p className="mt-3 leading-7 text-[var(--text-secondary)]">
                      {plan.description}
                    </p>
                  </div>

                  {plan.name === "Expert" && (
                    <span className="rounded-full bg-[#f3f0ea] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">
                      Best value
                    </span>
                  )}
                </div>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="pb-2 text-sm font-semibold text-[var(--text-secondary)]">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm font-semibold">
                      <span className="mr-3 text-[var(--accent)]">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
