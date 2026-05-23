"use client";

"use client";

import { useRouter } from "next/navigation";
// TODO: importar VerifyEmailView cuando SMTP funcione
// import { VerifyEmailView } from "@/features/auth/components/VerifyEmailView";
import { AnimatePresence } from "framer-motion";

import { SignupForm } from "@/features/auth/components/SignupForm";

export default function RegistroPage() {
  const router = useRouter();

  // TODO: Verificación por email — descomentar cuando SMTP funcione
  // const [verifyEmail, setVerifyEmail] = useState(null);
  // if (verifyEmail) {
  //   return (
  //     <AnimatePresence mode="wait">
  //       <VerifyEmailView email={verifyEmail} />
  //     </AnimatePresence>
  //   );
  // }

  return (
    <AnimatePresence mode="wait">
      <SignupForm onSuccess={(email) => router.push("/login?registered=true")} />
    </AnimatePresence>
  );
}
