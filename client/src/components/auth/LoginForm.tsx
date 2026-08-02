import { FormEvent, useState } from 'react';
import Input from '../ui/Input';
import Label from '../ui/Label';
import ErrorMessage from '../ui/ErrorMessage';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosLogIn } from 'react-icons/io';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../../services/authService';
import { queryKeys } from '../../utils/queryKeys';

export default function LoginForm() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me, response.data.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
          <IoIosLogIn className="h-7 w-7" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-text-900">
          Sign in to your account
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-input">Email address</Label>
        <Input
          id="email-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password-input">Password</Label>
        <Input
          id="password-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.currentTarget.value);
          }}
        />
      </div>

      {loginMutation.isError && (
        <ErrorMessage message={loginMutation.error.message} />
      )}

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-text-700">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-primary hover:text-primary-700"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
