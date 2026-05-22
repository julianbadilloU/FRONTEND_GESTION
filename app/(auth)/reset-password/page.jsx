import { redirect } from "next/navigation";

export default function ResetPasswordRedirect({ searchParams }) {
  const token = searchParams?.token || "";
  redirect(`/nueva-contrasena?token=${encodeURIComponent(token)}`);
}
