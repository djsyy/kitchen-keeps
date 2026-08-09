import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LuKeyRound } from 'react-icons/lu';
import { useState, type FormEvent } from 'react';
import { resetPassword } from '../../services/authService';
import ErrorMessage from '../ui/ErrorMessage';
import Input from '../ui/Input';
import Label from '../ui/Label';
import {
  PasswordConfirmationStatus,
  default as PasswordRequirements,
} from './PasswordRequirements';

type ResetPasswordFormProps = {
  token: string | null;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword,
      confirmNewPassword,
    });
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div className="flex justify-center">
          <div className="bg-primary-50 text-primary flex h-12 w-12 items-center justify-center rounded-full">
            <LuKeyRound className="h-6 w-6" />
          </div>
        </div>
        <div>
          <h2 className="text-text-900 text-xl font-bold">
            Reset link unavailable
          </h2>
          <p className="text-text-700 mt-2 text-sm leading-6">
            This password reset link is missing or incomplete. Request a new one
            to continue.
          </p>
        </div>
        <Link
          to="/forgot-password"
          className="text-primary hover:text-primary-700 text-sm font-bold"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <div className="flex flex-col gap-5 text-center" role="status">
        <div className="flex justify-center">
          <div className="bg-secondary-100 text-secondary-800 flex h-12 w-12 items-center justify-center rounded-full">
            <LuKeyRound className="h-6 w-6" />
          </div>
        </div>
        <div>
          <h2 className="text-text-900 text-xl font-bold">Password updated</h2>
          <p className="text-text-700 mt-2 text-sm leading-6">
            Your password has been reset. Sign in with your new password to
            continue.
          </p>
        </div>
        <Link
          to="/login"
          className="text-primary hover:text-primary-700 text-sm font-bold"
        >
          Sign in
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
        <h2 className="text-text-900 text-xl font-bold">Choose a password</h2>
        <p className="text-text-700 mt-2 text-sm leading-6">
          Set a new password for your account.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.currentTarget.value);
            resetPasswordMutation.reset();
          }}
          required
          minLength={8}
        />
        <PasswordRequirements password={newPassword} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-password-confirm">Confirm new password</Label>
        <Input
          id="reset-password-confirm"
          type="password"
          autoComplete="new-password"
          value={confirmNewPassword}
          onChange={(event) => {
            setConfirmNewPassword(event.currentTarget.value);
            resetPasswordMutation.reset();
          }}
          required
          minLength={8}
        />
        <PasswordConfirmationStatus
          password={newPassword}
          confirmation={confirmNewPassword}
          label="New passwords match"
        />
      </div>
      {resetPasswordMutation.isError && (
        <ErrorMessage message={resetPasswordMutation.error.message} />
      )}
      <button
        type="submit"
        className="bg-primary text-text-50 hover:bg-primary-700 w-full rounded-md px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
        disabled={resetPasswordMutation.isPending}
      >
        {resetPasswordMutation.isPending
          ? 'Updating password...'
          : 'Update password'}
      </button>
      <p className="text-text-700 text-center text-sm">
        <Link
          to="/login"
          className="text-primary hover:text-primary-700 font-bold"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
