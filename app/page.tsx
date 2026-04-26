"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Splash from "@/components/screens/splash";
import Onboarding from "@/components/screens/onboarding";
import ProfileSetup from "@/components/screens/profile-setup";
import AppShell from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (loading || showSplash) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <Splash key="splash" />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!user ? (
          <Onboarding key="onboarding" />
        ) : !profile ? (
          <ProfileSetup key="setup" />
        ) : (
          <AppShell key="main" />
        )}
      </AnimatePresence>
    </div>
  );
}
