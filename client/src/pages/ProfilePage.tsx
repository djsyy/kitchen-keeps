import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { useCurrentUser } from '../hooks/useCurrentUser';
import {
  deleteUser,
  updatePassword,
  updateUser,
} from '../services/authService';
import { getApiFieldError } from '../services/apiClient';
import { queryKeys } from '../utils/queryKeys';

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
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const initializedUserId = useRef<number | null>(null);

  useEffect(() => {
    if (!user) {
      initializedUserId.current = null;
      return;
    }

    if (initializedUserId.current !== user.id) {
      setName(user.name);
      setEmail(user.email);
      initializedUserId.current = user.id;
    }
  }, [user]);

  const updateNameMutation = useMutation({
    mutationFn: (updatedName: string) => updateUser({ name: updatedName }),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me, response.data.user);
      setName(response.data.user.name);
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: (updatedEmail: string) => updateUser({ email: updatedEmail }),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me, response.data.user);
      setEmail(response.data.user.email);
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

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.me });
      navigate('/', { replace: true });
    },
  });

  const clearPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const resetNameChanges = () => {
    setName(user?.name ?? '');
    updateNameMutation.reset();
  };

  const closeEmailEditor = () => {
    setEmail(user?.email ?? '');
    setIsEditingEmail(false);
    updateEmailMutation.reset();
  };

  const closePasswordEditor = () => {
    clearPasswordFields();
    setIsEditingPassword(false);
    updatePasswordMutation.reset();
  };

  const handleNameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (user && name !== user.name) {
      updateNameMutation.mutate(name);
    }
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (user && email !== user.email) {
      updateEmailMutation.mutate(email);
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

  const openDeleteDialog = () => {
    deleteUserMutation.reset();
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (!deleteUserMutation.isPending) {
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmDeleteAccount = () => {
    deleteUserMutation.mutate();
  };

  const nameError = getApiFieldError(updateNameMutation.error, 'name');
  const emailError = getApiFieldError(updateEmailMutation.error, 'email');
  const currentPasswordError = getApiFieldError(
    updatePasswordMutation.error,
    'currentPassword'
  );
  const newPasswordError = getApiFieldError(
    updatePasswordMutation.error,
    'newPassword'
  );
  const confirmNewPasswordError = getApiFieldError(
    updatePasswordMutation.error,
    'confirmNewPassword'
  );
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
                      updateNameMutation.reset();
                    }}
                    disabled={isPending || isEditingAnotherSetting}
                    aria-invalid={Boolean(nameError)}
                  />
                  {nameError && (
                    <p className="text-sm font-bold text-red-700">
                      {nameError}
                    </p>
                  )}
                </div>
                {updateNameMutation.isError && !nameError && (
                  <ErrorMessage message={updateNameMutation.error.message} />
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
                      disabled={updateNameMutation.isPending}
                    >
                      {updateNameMutation.isPending
                        ? 'Saving...'
                        : 'Save changes'}
                    </button>
                  </div>
                )}
              </form>
            </section>

            <SettingsRow
              title="Your Password"
              description="This password is used to verify your identity when signing in."
              value=""
              actionLabel={isEditingPassword ? 'Editing' : 'Change'}
              onActionClick={() => {
                setIsEditingPassword(true);
                updatePasswordMutation.reset();
              }}
              actionDisabled={isNameDirty || isEditingAnotherSetting}
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
                    onChange={(event) => {
                      setCurrentPassword(event.currentTarget.value);
                      updatePasswordMutation.reset();
                    }}
                    autoFocus
                    aria-invalid={Boolean(currentPasswordError)}
                  />
                  {currentPasswordError && (
                    <p className="text-sm font-bold text-red-700">
                      {currentPasswordError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.currentTarget.value);
                      updatePasswordMutation.reset();
                    }}
                    aria-invalid={Boolean(newPasswordError)}
                  />
                  {newPasswordError && (
                    <p className="text-sm font-bold text-red-700">
                      {newPasswordError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-new-password">
                    Confirm new password
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) => {
                      setConfirmNewPassword(event.currentTarget.value);
                      updatePasswordMutation.reset();
                    }}
                    aria-invalid={Boolean(confirmNewPasswordError)}
                  />
                  {confirmNewPasswordError && (
                    <p className="text-sm font-bold text-red-700">
                      {confirmNewPasswordError}
                    </p>
                  )}
                </div>
                {updatePasswordMutation.isError &&
                  !currentPasswordError &&
                  !newPasswordError &&
                  !confirmNewPasswordError && (
                    <ErrorMessage
                      message={updatePasswordMutation.error.message}
                    />
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
                updateEmailMutation.reset();
              }}
              actionDisabled={
                isPending || isNameDirty || isEditingAnotherSetting
              }
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
                    onChange={(event) => {
                      setEmail(event.currentTarget.value);
                      updateEmailMutation.reset();
                    }}
                    autoFocus
                    aria-invalid={Boolean(emailError)}
                  />
                  {emailError && (
                    <p className="text-sm font-bold text-red-700">
                      {emailError}
                    </p>
                  )}
                </div>
                {!emailError && updateEmailMutation.isError && (
                  <ErrorMessage message={updateEmailMutation.error.message} />
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
                      updateEmailMutation.isPending || email === user?.email
                    }
                  >
                    {updateEmailMutation.isPending
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
                    Permanently remove your account and saved libraries.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-fit rounded-md bg-primary-700 px-4 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={openDeleteDialog}
                  disabled={deleteUserMutation.isPending}
                >
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>

      {isDeleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-text-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteDialog();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            className="w-full max-w-md rounded-2xl bg-background-50 p-6 shadow-xl"
          >
            <div className="space-y-3">
              <h2
                id="delete-account-title"
                className="text-xl font-bold text-text-950"
              >
                Delete your account?
              </h2>
              <p
                id="delete-account-description"
                className="text-sm text-text-700"
              >
                This permanently removes your account and saved libraries. This
                action cannot be undone.
              </p>
              {deleteUserMutation.isError && (
                <ErrorMessage message={deleteUserMutation.error.message} />
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-background-300 px-4 py-2 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={closeDeleteDialog}
                disabled={deleteUserMutation.isPending}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-primary-700 px-4 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={confirmDeleteAccount}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending
                  ? 'Deleting account...'
                  : 'Delete account'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
