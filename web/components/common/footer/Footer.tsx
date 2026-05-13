"use client";

import React, { useState } from "react";
import TopFooter from "./TopFooter";
import Container from "../Container";
import { Title } from "../text";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { payment } from "../../../assets/image";

import { toast } from "sonner";
import HrLine from "../HrLine";

const informationTab = [
  { label: "About Us", href: "/about" },
  { label: "Top Searches", href: "/search" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Returns & Exchanges", href: "/returns" },
];
const CustomerTab = [
  { label: "My Account", href: "/account" },
  { label: "Track Order", href: "/track-order" },
  { label: "Shop", href: "/shop" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "My Analytics", href: "/user/analytics" },
];
const OthersTab = [
  { label: "Partnership", href: "/programs" },
  { label: "Associate", href: "/programs" },
  { label: "Wholesale Socks", href: "/programs" },
  { label: "Wholesale Funny", href: "/programs" },
  { label: "Others", href: "/others" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate network delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.error("Newsletter service is currently unavailable.");
      setEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full flex flex-col">
      {/* Dark Footer Wrapper */}
      <TopFooter />
      <div className="w-full bg-[#1a1a2c] text-white">
        <HrLine className="border-white/10" />

        {/* FooterMiddle */}
        <Container className="py-10 hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <Title className="text-lg mb-4">Information</Title>
            <div className="flex flex-col gap-2">
              {informationTab?.map((item) => (
                <Link
                  href={item?.href}
                  key={item?.label}
                  className="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <Title className="text-lg mb-4">Customer Care</Title>
            <div className="flex flex-col gap-2">
              {CustomerTab?.map((item) => (
                <Link
                  href={item?.href}
                  key={item?.label}
                  className="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>{" "}
          <div>
            <Title className="text-lg mb-4">Other Business</Title>
            <div className="flex flex-col gap-2">
              {OthersTab?.map((item) => (
                <Link
                  href={item?.href}
                  key={item?.label}
                  className="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <Title className="text-lg mb-4">Newsletter</Title>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col gap-2 relative group"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="border rounded-full pl-3 pr-16 h-14 placeholder:text-muted/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-transparent text-white"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-linear-to-r from-primary to-primary text-background w-14 h-14 rounded-full flex items-center justify-center absolute top-0 right-0 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border -rotate-45 group-hover:rotate-0 hoverEffect"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight />
                )}
              </button>
            </form>
          </div>
        </Container>
        <HrLine className="border-white/10" />

        {/* FooterBottom */}
        <Container className="py-5 flex flex-col items-center justify-between gap-2 md:gap-5 text-white/60">
          <Link
            href={"https://www.reactbd.com/"}
            className="hover:text-background hoverEffect"
          >
            <p className="text-sm">© 2026 reactbd.com All rights reserved.</p>
          </Link>

          <Image
            src={payment}
            alt="paymentImage"
            className="mix-blend-screen"
          />
        </Container>
      </div>
    </footer>
  );
};

export default Footer;