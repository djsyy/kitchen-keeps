import { FormEvent, useState } from 'react';
import Input from '../ui/Input';
import Label from '../ui/Label';
import ErrorMessage from '../ui/ErrorMessage';
import { Link, useNavigate } from 'react-router-dom';
import { VscAccount } from 'react-icons/vsc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUser } from '../../services/authService';

export default function RegisterForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'me'], response.data.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    registerMutation.mutate({ name, email, password, confirmPassword });
  };

  return (
    <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
          <VscAccount className="h-7 w-7" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-text-900">Create an account</h2>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name-input">Name</Label>
        <Input
          id="name-input"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
          }}
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.currentTarget.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password-input">Confirm Password</Label>
        <Input
          id="confirm-password-input"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.currentTarget.value);
          }}
        />
      </div>

      {registerMutation.isError && (
        <ErrorMessage message={registerMutation.error.message} />
      )}

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-text-700">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-primary hover:text-primary-700"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
