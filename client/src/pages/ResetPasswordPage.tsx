import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token'));

  useEffect(() => {
    if (!token) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      document.title,
      window.location.pathname
    );
  }, [token]);

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      <section className="border-background-200 bg-background-50 w-full max-w-md rounded-lg border p-6 shadow-sm sm:p-8">
        <ResetPasswordForm token={token} />
      </section>
    </main>
  );
}
