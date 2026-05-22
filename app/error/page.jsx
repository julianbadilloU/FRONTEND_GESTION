import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Error</h1>
        <p className="text-gray-600">Ocurrió un error inesperado.</p>
        <Link href="/login" className="text-[#81af6d] hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
