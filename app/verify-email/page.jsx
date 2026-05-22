'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/http/api-client';
import { saveSessionTokens } from '@/lib/auth/token-storage';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace de verificación no es válido o está incompleto.');
      return;
    }

    const verify = async () => {
      try {
        const response = await apiClient.post('/api/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message || 'Correo verificado exitosamente.');
        
        // Auto-login y redirección
        if (response.data.data && response.data.data.token) {
            const { token: jwtToken, user } = response.data.data;
            saveSessionTokens({ accessToken: jwtToken });
            
            const role = (user?.role || '').toLowerCase();
            setTimeout(() => {
                if (role === 'adoptante') {
                    router.push('/adoptante/onboarding');
                } else if (role === 'albergue') {
                    router.push('/albergue/onboarding');
                } else {
                    router.push('/login');
                }
            }, 1500); // Pequeña pausa para que vean el mensaje de éxito antes de redirigir
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Error al verificar el correo.');
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
        {status === 'loading' && (
          <div className="animate-pulse">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Verificando tu cuenta...</h2>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">¡Cuenta Verificada!</h2>
            <p className="mb-6 text-gray-600">{message}</p>
            <Link 
              href="/login"
              className="inline-block w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Error en la verificación</h2>
            <p className="mb-6 text-gray-600">{message}</p>
            <Link 
              href="/registro"
              className="inline-block w-full rounded-lg bg-gray-600 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
            >
              Volver al registro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"></div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
