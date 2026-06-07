import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-background">
      <section className="w-full max-w-md rounded-3xl border border-white/40 bg-white/40 p-8 shadow-2xl backdrop-blur-xl">
        <LoginForm />
      </section>
    </main>
  );
}
