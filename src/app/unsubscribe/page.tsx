"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, AlertCircle, Mail } from "lucide-react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const status    = params.get("status");   // "success" | "error"
  const already   = params.get("already");  // "1" if already unsubscribed

  const isSuccess = status === "success";
  const isAlready = already === "1";

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Top accent bar */}
        <div className="h-1 w-full rounded-t-xl"
          style={{ background: "linear-gradient(90deg,#c2410c,#f97316,#fb923c,#fdba74,#fb923c,#f97316,#c2410c)" }} />

        <div className="bg-[#1a1a24] rounded-b-xl border border-white/[0.07] px-10 py-12 text-center">

          {/* Logo mark */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(to bottom, #f97316, #c2410c)" }}>
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">PropMail</span>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            {isSuccess ? (
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white mb-3">
            {isSuccess
              ? isAlready
                ? "Already Unsubscribed"
                : "Unsubscribed"
              : "Invalid Link"}
          </h1>

          {/* Body */}
          <p className="text-sm leading-relaxed text-gray-400 mb-8">
            {isSuccess
              ? isAlready
                ? "You were already removed from this mailing list. You will not receive any further emails."
                : "You have been successfully removed from this mailing list. You will no longer receive emails from this agent."
              : "This unsubscribe link is invalid or has expired. Please contact the sender directly to be removed from their list."}
          </p>

          {/* Divider */}
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-xs text-gray-600">
              Powered by <span className="text-[#f97316]">PropMail</span>
              {" · "}Real Estate Email Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-[#f97316]/30 border-t-[#f97316] animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
