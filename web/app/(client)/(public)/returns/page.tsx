import type { Metadata } from "next";
import ReturnsExchangePage from "@/components/pages/ReturnsExchangePage";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "Entry's hassle-free returns and exchanges policy. Return or swap any item within 30 days. Fast refunds, free exchanges, and 24/7 support.",
  keywords: ["returns", "exchanges", "refund policy", "return policy", "swap"],
};

export default function ReturnsPage() {
  return <ReturnsExchangePage />;
}
