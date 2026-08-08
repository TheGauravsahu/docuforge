import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingSection() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "per user/month, billed annually",
      popular: false,
      features: [
        "Up to 5 Document Projects",
        "Standard Academic Templates",
        "PDF Export (Printable)",
        "Fabric.js Canva Visual Editor",
      ],
      cta: "Get Started Free",
    },
    {
      name: "Standard",
      price: "$85",
      period: "per user/month, billed annually",
      popular: true,
      features: [
        "Unlimited Document Projects",
        "Gemini 2.5 Pro High-Precision Generation",
        "PDF, PPTX & DOCX Multi-Format Exports",
        "Full Canva Canvas Visual Customization",
        "Student Info Auto-Fill Placeholders",
        "Priority Generation Queue",
      ],
      cta: "Choose Standard",
    },
    {
      name: "Premium",
      price: "$120",
      period: "per user/month, billed annually",
      popular: false,
      features: [
        "Everything in Standard",
        "Custom Institutional Schema Creation",
        "Dedicated API Access & Exports",
        "Team Workspace Collaboration",
        "24/7 Priority Support & SLAs",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-4xl  font-bold text-white tracking-tight">
          Find the Perfect Plan for Your Business
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          Unlock your full potential with flexible pricing tailored for
          students, researchers, and enterprises.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-[#0E1017] border rounded-3xl p-8 flex flex-col justify-between shadow-2xl ${
              plan.popular
                ? "border-brand-blue ring-2 ring-brand-blue/30 bg-gradient-to-b from-[#131726] to-[#0E1017]"
                : "border-gray-800/80 hover:border-gray-700"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-brand-blue to-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                Popular Choice
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {plan.price}
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium block mt-1">
                  {plan.period}
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-800/80">
                {plan.features.map((feat, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-center gap-3 text-xs text-gray-300"
                  >
                    <div className="w-4 h-4 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => navigate("/auth")}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
                  plan.popular
                    ? "bg-brand-blue text-white hover:bg-blue-600 shadow-brand-blue/25"
                    : "bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-700"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
