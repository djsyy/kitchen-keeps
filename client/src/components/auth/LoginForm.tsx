import { FormEvent, useState } from 'react';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosLogIn } from 'react-icons/io';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../../services/authService';

export default function LoginForm() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'me'], response);
      navigate('/dashboard', { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form
      className="flex flex-col justify-center items-center m-4 p-4 gap-2"
      onSubmit={handleSubmit}
    >
      <div className="h-10">
        <IoIosLogIn className="h-16 w-8 text-primary-400" />
      </div>
      <div className="text-center my-3">
        <h2 className="text-xl">Sign in to your account</h2>
      </div>

      <div className="my-3">
        <Label htmlFor="email-input">Email address</Label>
        <Input
          id="email-input"
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
          }}
        />
      </div>

      <div className="my-3">
        <Label htmlFor="password-input">Password</Label>
        <Input
          id="password-input"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.currentTarget.value);
          }}
        />
      </div>

      {loginMutation.isError && (
        <p className="text-sm font-bold text-red-700">
          {loginMutation.error.message}
        </p>
      )}

      <button
        type="submit"
        className="container mx-auto p-2 bg-primary rounded-md text-text-100 hover:bg-primary-700"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>

      <p>
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-text-950 hover:text-text-500">
          Create one
        </Link>
      </p>
    </form>
  );
}
