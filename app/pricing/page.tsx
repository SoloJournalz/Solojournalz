import PublicNavbar from "@/app/components/layout/public-navbar";
import PublicFooter from "@/app/components/layout/public-footer";

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

      <main className="min-h-screen bg-[#f7f7f5] px-6 py-20 text-black">
        <section className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b8860b]">
              Prices
            </p>

            <h1 className="mt-5 text-5xl font-black tracking-tight md:text-6xl">
              Simple pricing for disciplined traders.
            </h1>

            <p className="mt-6 text-lg leading-8 text-[#6b7280]">
              Start with the essentials or unlock the full performance
              intelligence layer with Expert.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="rounded-[1.75rem] border border-black/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#7f1010]/25 hover:shadow-xl md:p-8"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black">{plan.name}</h2>
                    <p className="mt-3 leading-7 text-[#6b7280]">
                      {plan.description}
                    </p>
                  </div>

                  {plan.name === "Expert" && (
                    <span className="rounded-full bg-[#f3f0ea] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#7f1010]">
                      Best value
                    </span>
                  )}
                </div>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="pb-2 text-sm font-semibold text-[#6b7280]">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm font-semibold">
                      <span className="mr-3 text-[#7f1010]">•</span>
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
