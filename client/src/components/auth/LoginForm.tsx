import { FormEvent, useState } from 'react';
import Input from '../ui/Input';
import Label from '../ui/Label';
import ErrorMessage from '../ui/ErrorMessage';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosLogIn } from 'react-icons/io';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../../services/authService';
import { queryKeys } from '../../utils/queryKeys';
import { getPostAuthDestination } from '../../utils/authRedirect';

export default function LoginForm() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const statusMessage =
    location.state &&
    typeof location.state === 'object' &&
    typeof location.state.message === 'string'
      ? location.state.message
      : null;

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me, response.data.user);
      navigate(getPostAuthDestination(location.state), { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex justify-center">
        <div className="bg-primary-50 text-primary flex h-12 w-12 items-center justify-center rounded-full">
          <IoIosLogIn className="h-7 w-7" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-text-900 text-xl font-bold">
          Sign in to your account
        </h2>
      </div>

      {statusMessage && (
        <p className="bg-primary-50 text-primary rounded-md px-3 py-2 text-center text-sm font-medium">
          {statusMessage}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-input">Email address</Label>
        <Input
          id="email-input"
          type="email"
          autoComplete="email"
          maxLength={255}
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
            loginMutation.reset();
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
            loginMutation.reset();
          }}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-primary hover:text-primary-700 text-sm font-bold"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {loginMutation.isError && (
        <ErrorMessage message={loginMutation.error.message} />
      )}

      <button
        type="submit"
        className="bg-primary text-text-50 hover:bg-primary-700 w-full rounded-md px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-text-700 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          state={location.state}
          className="text-primary hover:text-primary-700 font-bold"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
