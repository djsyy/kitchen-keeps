import { FormEvent, useState } from 'react';
import Input from '../ui/Input';
import Label from '../ui/Label';
import ErrorMessage from '../ui/ErrorMessage';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { VscAccount } from 'react-icons/vsc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUser } from '../../services/authService';
import { queryKeys } from '../../utils/queryKeys';
import { getPostAuthDestination } from '../../utils/authRedirect';
import {
  PasswordConfirmationStatus,
  default as PasswordRequirements,
} from './PasswordRequirements';

export default function RegisterForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me, response.data.user);
      navigate(getPostAuthDestination(location.state), { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    registerMutation.mutate({ name, email, password, confirmPassword });
  };

  return (
    <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex justify-center">
        <div className="bg-primary-50 text-primary flex h-12 w-12 items-center justify-center rounded-full">
          <VscAccount className="h-7 w-7" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-text-900 text-xl font-bold">Create an account</h2>
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
          maxLength={255}
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
          minLength={8}
          value={password}
          onChange={(e) => {
            setPassword(e.currentTarget.value);
          }}
        />
        <PasswordRequirements password={password} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password-input">Confirm Password</Label>
        <Input
          id="confirm-password-input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.currentTarget.value);
          }}
        />
        <PasswordConfirmationStatus
          password={password}
          confirmation={confirmPassword}
        />
      </div>

      {registerMutation.isError && (
        <ErrorMessage message={registerMutation.error.message} />
      )}

      <button
        type="submit"
        className="bg-primary text-text-50 hover:bg-primary-700 w-full rounded-md px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-text-700 text-center text-sm">
        Already have an account?{' '}
        <Link
          to="/login"
          state={location.state}
          className="text-primary hover:text-primary-700 font-bold"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
