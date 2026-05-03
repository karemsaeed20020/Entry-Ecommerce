import React from "react";
import Container from "../Container";
// import { topHelpCenter } from "@/constants/data";
// import Link from "next/link";
import TopSocialLinksClient from "./TopSocialLinksClient";
import SelectCurrency from "./SelectCurrency";

const TopBanner = () => {
  return (
    <div className="w-full bg-primary text-primary-foreground py-2 text-sm font-medium border-b border-b-border/20">
      <Container className="flex items-center justify-between">
        <p className="text-center">
          Black Friday!{" "}
          <span className="hidden md:inline-flex">
            Every Saturday - 50% Off!
          </span>
        </p>
        <div className="flex items-center justify-end">
          <SelectCurrency />
          <TopSocialLinksClient />
        </div>
      </Container>
    </div>
  );
};

export default TopBanner;
