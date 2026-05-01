"use client";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logo } from "@/assets/image";
const AuthHeader = () => {
  const router = useRouter();
  return (
    <header className="bg-primary text-primary-foreground w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-background/70 hover:text-background hoverEffect"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <Link href={"/"} className="hover:opacity-80 transition-opacity">
            <Image src={logo} alt="Entry Logo" className="w-36" priority />
          </Link>
          <div className="w-20" />
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
