import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-background-200 bg-background-50 p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </section>
    </main>
  );
}
