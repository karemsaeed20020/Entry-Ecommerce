"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AIReviewSummaryProps {
  productId: string;
}

export default function AIReviewSummary({ productId }: AIReviewSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/ai/product-summary/${productId}`);
        const data = await response.json();
        
        if (data.summary) {
          setSummary(data.summary);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch AI summary:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchSummary();
    }
  }, [productId]);

  if (error || (!isLoading && !summary)) {
    return null; // Don't show anything if it fails
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 my-6 relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 text-blue-200/50 transform rotate-12">
        <Sparkles size={80} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Sparkles size={16} />
          </div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            AI Review Summary
            <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Beta
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-500 py-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm">Reading customer reviews to generate summary...</span>
          </div>
        ) : (
          <p className="text-gray-700 text-sm leading-relaxed">
            {summary}
          </p>
        )}
      </div>
    </motion.div>
  );
}
