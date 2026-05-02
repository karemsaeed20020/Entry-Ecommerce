/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from "@/components/ui/button";
import { BackendUserData } from "@/lib/oauthService";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OAuthError extends Error {
    statusCode?: number;
    data?: unknown;
}

interface OAuthButtonProps {
    provider: "google" | "github";
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    redirectTo?: string;
    onSuccess?: (userData: BackendUserData) => void;
    onError?: (error: string) => void;
}

const OAuthButton = ({
    provider, 
    children, 
    className = "", 
    disabled = false, 
    redirectTo = "/user/profile", 
    onSuccess, 
    onError 
}: OAuthButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // Fixed typo from 'rouetr'

    const handleOAuthSignIn = async () => {
        setIsLoading(true);
        try {
            // Your OAuth logic here (e.g., calling your backend or Auth.js)
            // Example placeholder:
            // const data = await signInWithProvider(provider);
            // if (onSuccess) onSuccess(data);
            
            router.push(redirectTo);
        } catch (error: any) {
            console.error(`${provider} Sign-in Error:`, error);
            if (onError) onError(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            className={`w-full ${className}`}
            disabled={disabled || isLoading}
            onClick={handleOAuthSignIn} // Added the click handler
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <svg
                        className="animate-spin h-4 w-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        />
                    </svg>
                    Signing in...
                </div>
            ) : (
                children
            )}
        </Button>
    );
}

export default OAuthButton;