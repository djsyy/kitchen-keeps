import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LuKeyRound } from 'react-icons/lu';
import { useState, type FormEvent } from 'react';
import { forgotPassword } from '../../services/authService';
import ErrorMessage from '../ui/ErrorMessage';
import Input from '../ui/Input';
import Label from '../ui/Label';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    forgotPasswordMutation.mutate({ email });
  };

  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className="flex flex-col gap-5 text-center" role="status">
        <div className="flex justify-center">
          <div className="bg-secondary-100 text-secondary-800 flex h-12 w-12 items-center justify-center rounded-full">
            <LuKeyRound className="h-6 w-6" />
          </div>
        </div>
        <div>
          <h2 className="text-text-900 text-xl font-bold">Check your email</h2>
          <p className="text-text-700 mt-2 text-sm leading-6">
            If an account exists for that email, a password reset link has been
            sent.
          </p>
        </div>
        <Link
          to="/login"
          className="text-primary hover:text-primary-700 text-sm font-bold"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex justify-center">
        <div className="bg-primary-50 text-primary flex h-12 w-12 items-center justify-center rounded-full">
          <LuKeyRound className="h-6 w-6" />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-text-900 text-xl font-bold">Reset password</h2>
        <p className="text-text-700 mt-2 text-sm leading-6">
          Enter your email and we&apos;ll send a reset link if an account
          exists.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="forgot-password-email">Email address</Label>
        <Input
          id="forgot-password-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.currentTarget.value);
            forgotPasswordMutation.reset();
          }}
          required
        />
      </div>
      {forgotPasswordMutation.isError && (
        <ErrorMessage message={forgotPasswordMutation.error.message} />
      )}
      <button
        type="submit"
        className="bg-primary text-text-50 hover:bg-primary-700 w-full rounded-md px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
        disabled={forgotPasswordMutation.isPending}
      >
        {forgotPasswordMutation.isPending
          ? 'Sending link...'
          : 'Send reset link'}
      </button>
      <p className="text-text-700 text-center text-sm">
        Remembered your password?{' '}
        <Link
          to="/login"
          className="text-primary hover:text-primary-700 font-bold"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
