import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { updatePassword, updateUser } from '../services/authService';

type SettingsRowProps = {
  title: string;
  description: string;
  value: string;
  actionLabel?: string;
  onActionClick?: () => void;
  actionDisabled?: boolean;
  isEditing?: boolean;
  children?: ReactNode;
};

function SettingsRow({
  title,
  description,
  value,
  actionLabel,
  onActionClick,
  actionDisabled = false,
  isEditing = false,
  children,
}: SettingsRowProps) {
  return (
    <section className="border-b border-background-200 pb-6 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-text-950">{title}</h2>
          <p className="text-sm text-text-700">{description}</p>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <p
            className="max-w-xs truncate text-sm font-medium text-text-950"
            title={value}
          >
            {value}
          </p>
          {actionLabel && (
            <button
              type="button"
              className="shrink-0 rounded-md border border-background-300 px-4 py-2 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onActionClick}
              disabled={actionDisabled}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-5 border-t border-background-200 pt-5">
          {children}
        </div>
      )}
    </section>
  );
}

export default function ProfilePage() {
  const { data: user, isPending } = useCurrentUser();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'me'], response.data.user);
      setIsEditingEmail(false);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      clearPasswordFields();
      setIsEditingPassword(false);
    },
  });

  const clearPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const resetNameChanges = () => {
    setName(user?.name ?? '');
    updateUserMutation.reset();
  };

  const closeEmailEditor = () => {
    setEmail(user?.email ?? '');
    setIsEditingEmail(false);
    updateUserMutation.reset();
  };

  const closePasswordEditor = () => {
    clearPasswordFields();
    setIsEditingPassword(false);
    updatePasswordMutation.reset();
  };

  const handleNameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (user && name !== user.name) {
      updateUserMutation.mutate({ name });
    }
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (user && email !== user.email) {
      updateUserMutation.mutate({ email });
    }
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updatePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  };

  const userMutationError = updateUserMutation.isError
    ? updateUserMutation.error.message
    : null;
  const passwordMutationError = updatePasswordMutation.isError
    ? updatePasswordMutation.error.message
    : null;
  const isEditingAnotherSetting = isEditingEmail || isEditingPassword;
  const isNameDirty = Boolean(user && name !== user.name);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-text-950">Account Settings</h1>
          <p className="text-base text-text-700">
            Edit your account details and preferences.
          </p>
        </div>

        <section className="rounded-2xl border border-background-200 bg-background-50 p-6 shadow-lg sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6">
            <section className="border-b border-background-200 pb-6">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-text-950">Your Name</h2>
                <p className="text-sm text-text-700">
                  This is the name shown on your account.
                </p>
              </div>
              <form
                className="flex max-w-xl flex-col gap-4"
                onSubmit={handleNameSubmit}
              >
                <div className="mt-4 flex flex-col gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(event) => {
                      setName(event.currentTarget.value);
                      updateUserMutation.reset();
                    }}
                    disabled={isPending || isEditingAnotherSetting}
                  />
                </div>
                {userMutationError && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {userMutationError}
                  </p>
                )}
                {isNameDirty && (
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="rounded-md border border-background-300 px-4 py-2 text-sm font-bold text-text-700 transition hover:bg-background-100"
                      onClick={resetNameChanges}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending
                        ? 'Saving...'
                        : 'Save changes'}
                    </button>
                  </div>
                )}
              </form>
            </section>

            <SettingsRow
              title="Your Password"
              description="Choose a new password after confirming the one you use today."
              value=""
              actionLabel={isEditingPassword ? 'Editing' : 'Change'}
              onActionClick={() => {
                setIsEditingPassword(true);
                updatePasswordMutation.reset();
              }}
              actionDisabled={isEditingAnotherSetting}
              isEditing={isEditingPassword}
            >
              <form
                className="flex max-w-xl flex-col gap-4"
                onSubmit={handlePasswordSubmit}
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.currentTarget.value)
                    }
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.currentTarget.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-new-password">
                    Confirm new password
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) =>
                      setConfirmNewPassword(event.currentTarget.value)
                    }
                  />
                </div>
                {passwordMutationError && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {passwordMutationError}
                  </p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-md border border-background-300 px-4 py-2 text-sm font-bold text-text-700 transition hover:bg-background-100"
                    onClick={closePasswordEditor}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      updatePasswordMutation.isPending ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmNewPassword
                    }
                  >
                    {updatePasswordMutation.isPending
                      ? 'Saving...'
                      : 'Update password'}
                  </button>
                </div>
              </form>
            </SettingsRow>

            <SettingsRow
              title="Your Email"
              description="This address is used to sign in and receive account recovery emails."
              value={isPending ? 'Loading...' : (user?.email ?? '')}
              actionLabel={isEditingEmail ? 'Editing' : 'Change'}
              onActionClick={() => {
                setIsEditingEmail(true);
                updateUserMutation.reset();
              }}
              actionDisabled={isPending || isEditingAnotherSetting}
              isEditing={isEditingEmail}
            >
              <form
                className="flex max-w-xl flex-col gap-4"
                onSubmit={handleEmailSubmit}
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-email">Email address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                    autoFocus
                  />
                </div>
                {userMutationError && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {userMutationError}
                  </p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-md border border-background-300 px-4 py-2 text-sm font-bold text-text-700 transition hover:bg-background-100"
                    onClick={closeEmailEditor}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      updateUserMutation.isPending || email === user?.email
                    }
                  >
                    {updateUserMutation.isPending
                      ? 'Saving...'
                      : 'Save changes'}
                  </button>
                </div>
              </form>
            </SettingsRow>

            <section className="border-b border-background-200 pb-6 last:border-b-0 last:pb-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-text-950">
                    Delete Your Account
                  </h2>
                  <p className="text-sm text-text-700">
                    Permanently remove your account, recipes, and saved
                    libraries.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled
                >
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
