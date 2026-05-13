"use client";

import React, { useState } from "react";
import Link from "next/link";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import {
  RotateCcw,
  RefreshCw,
  ShieldCheck,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Package,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Star,
  Headphones,
} from "lucide-react";

/* ─── Types ─── */
interface FAQItem {
  q: string;
  a: string;
}

/* ─── Data ─── */
const STEPS = [
  {
    step: "01",
    icon: <Package className="w-6 h-6" />,
    title: "Initiate Request",
    desc: "Log in to your account and navigate to your orders. Select the item you wish to return and click 'Request Return'.",
    color: "from-violet-500 to-purple-600",
  },
  {
    step: "02",
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Get Approval",
    desc: "Our team reviews your request within 24 hours and sends a prepaid shipping label to your registered email.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    step: "03",
    icon: <Truck className="w-6 h-6" />,
    title: "Ship the Item",
    desc: "Pack the item securely in its original packaging and drop it off at any authorised courier location.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    step: "04",
    icon: <CreditCard className="w-6 h-6" />,
    title: "Refund Issued",
    desc: "Once we receive and inspect the item, your refund is processed within 3–5 business days to the original payment method.",
    color: "from-rose-500 to-pink-600",
  },
];

const POLICIES = [
  {
    icon: <Clock className="w-5 h-5" />,
    title: "30-Day Return Window",
    desc: "Returns are accepted within 30 days of delivery for most items.",
    accent: "bg-violet-50 border-violet-200 text-violet-700",
    iconBg: "bg-violet-100",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Quality Guarantee",
    desc: "Defective or damaged items are replaced at no cost, no questions asked.",
    accent: "bg-emerald-50 border-emerald-200 text-emerald-700",
    iconBg: "bg-emerald-100",
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Free Exchanges",
    desc: "Exchange for a different size or colour with free two-way shipping on your first exchange.",
    accent: "bg-blue-50 border-blue-200 text-blue-700",
    iconBg: "bg-blue-100",
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Fast Refunds",
    desc: "Refunds are processed within 3–5 business days of item inspection.",
    accent: "bg-amber-50 border-amber-200 text-amber-700",
    iconBg: "bg-amber-100",
  },
];

const ELIGIBLE = [
  "Unused items in original packaging",
  "Items with all tags attached",
  "Defective or incorrect items",
  "Items damaged during shipping",
  "Size/colour exchanges within 30 days",
];

const NOT_ELIGIBLE = [
  "Used, washed, or altered items",
  "Items without original packaging",
  "Digital downloads or gift cards",
  "Personalised / custom-made products",
  "Perishable goods and consumables",
];

const FAQS: FAQItem[] = [
  {
    q: "How long does the return process take?",
    a: "From the moment we receive your item, inspection takes 1–2 business days and refunds are issued within 3–5 business days. Total turnaround is typically 7–10 business days.",
  },
  {
    q: "Can I exchange for a different product entirely?",
    a: "Yes! You can exchange for any product of equal or lesser value. If the new item costs more, you will be charged the difference. Navigate to your orders and select 'Request Exchange'.",
  },
  {
    q: "What if my item arrived damaged?",
    a: "Please take photos immediately and contact our support team within 48 hours of delivery. We will arrange a free collection and send a replacement at no additional cost.",
  },
  {
    q: "Do I need the original receipt?",
    a: "Your order ID from your Entry account serves as your proof of purchase. We can locate your order directly from your account — no physical receipt needed.",
  },
  {
    q: "Will I be refunded the original shipping cost?",
    a: "Shipping costs are refunded only if the return is due to our error (wrong item, defective product). Standard change-of-mind returns receive a refund for the item cost only.",
  },
  {
    q: "Can I return items bought on sale?",
    a: "Sale items are eligible for exchange or store credit only. They cannot be refunded to the original payment method unless the item is defective.",
  },
];

/* ─── Sub-components ─── */
function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
        >
          <button
            id={`faq-btn-${i}`}
            className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-gray-800 text-sm">
              {item.q}
            </span>
            <span className="shrink-0 text-primary">
              {open === i ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              open === i ? "max-h-48" : "max-h-0"
            }`}
          >
            <p className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function ReturnsExchangePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <Container className="pt-6">
        <PageBreadcrumb currentPage="Returns & Exchanges" items={[]} />
      </Container>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2c] via-[#22223b] to-[#1a1a2c] py-20 mt-4">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#d52245]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-6">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Hassle-Free Returns — 100% Satisfaction Guarantee
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Returns &amp; Exchanges
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-base md:text-lg mb-8">
            Changed your mind? Got the wrong size? We make it simple to return or
            swap any item — no stress, no hassle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/user/orders"
              id="start-return-btn"
              className="inline-flex items-center gap-2 bg-[#d52245] hover:bg-[#b91c3c] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-[#d52245]/30 hover:shadow-[#d52245]/50 hover:-translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              Start a Return
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              id="contact-support-btn"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <Headphones className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-16 space-y-16">
        {/* Policy Cards */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Our Return Promise
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Every purchase is backed by our commitment to your satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {POLICIES.map((p, i) => (
              <div
                key={i}
                className={`border rounded-2xl p-6 flex flex-col gap-3 ${p.accent} transition-transform hover:-translate-y-1 duration-200`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                  {p.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{p.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works — Timeline */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              How It Works
            </h2>
            <p className="text-gray-500 text-sm">
              Four simple steps to complete your return or exchange.
            </p>
          </div>
          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-12 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-0.5 bg-gradient-to-r from-violet-200 via-blue-200 to-rose-200 z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {STEPS.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-4">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-xl shadow-black/10`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 tracking-widest">
                      STEP {s.step}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-0.5 mb-1.5">
                      {s.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Eligibility Grid */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What&apos;s Eligible?
            </h2>
            <p className="text-gray-500 text-sm">
              Check if your item qualifies before submitting a request.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Eligible */}
            <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-sm">
              <div className="bg-emerald-50 px-6 py-4 flex items-center gap-2 border-b border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-800">Eligible for Return</h3>
              </div>
              <ul className="p-6 space-y-3">
                {ELIGIBLE.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Eligible */}
            <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-sm">
              <div className="bg-rose-50 px-6 py-4 flex items-center gap-2 border-b border-rose-200">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-rose-800">Not Eligible</h3>
              </div>
              <ul className="p-6 space-y-3">
                {NOT_ELIGIBLE.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm">
              Everything you need to know about returns and exchanges.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={FAQS} />
          </div>
        </section>

        {/* CTA Banner */}
        <section>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2c] to-[#2d2d4e] rounded-3xl p-10 md:p-14 text-center shadow-2xl">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#d52245]/10 rounded-full blur-3xl" />
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Need Help With a Return?
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto text-sm">
              Our support team is available 24/7 to guide you through every step
              of the return or exchange process.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/user/orders"
                id="cta-return-btn"
                className="inline-flex items-center gap-2 bg-[#d52245] hover:bg-[#b91c3c] text-white font-semibold px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                My Orders &amp; Returns
              </Link>
              <Link
                href="/contact"
                id="cta-contact-btn"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-all backdrop-blur-sm"
              >
                <Headphones className="w-4 h-4" />
                Live Chat Support
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
