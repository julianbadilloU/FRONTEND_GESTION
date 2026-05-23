"use client";

"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import { SignupForm } from "@/features/auth/components/SignupForm";

export default function RegistroPage() {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <SignupForm onSuccess={(email) => {
        router.push("/login?registered=true");
      }} />
    </AnimatePresence>
  );
}
