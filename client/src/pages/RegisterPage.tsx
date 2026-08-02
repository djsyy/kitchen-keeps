import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      <section className="border-background-200 bg-background-50 w-full max-w-md rounded-lg border p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </section>
    </main>
  );
}
