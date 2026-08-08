import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { ProfileSkeleton } from '../components/ui/LoadingSkeletons';
import { useCurrentUser } from '../hooks/useCurrentUser';
import {
  deleteUser,
  updatePassword,
  updateUser,
} from '../services/authService';
import { getApiFieldError } from '../services/apiClient';
import { queryKeys } from '../utils/queryKeys';
import {
  PasswordConfirmationStatus,
  default as PasswordRequirements,
} from '../components/auth/PasswordRequirements';

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
    <section className="border-background-200 border-b pb-6 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-text-950 text-base font-bold">{title}</h2>
          <p className="text-text-700 text-sm">{description}</p>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <p
            className="text-text-950 max-w-xs truncate text-sm font-medium"
            title={value}
          >
            {value}
          </p>
          {actionLabel && (
            <button
              type="button"
              className="border-background-300 text-text-700 hover:bg-background-100 shrink-0 rounded-md border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onActionClick}
              disabled={actionDisabled}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="border-background-200 mt-5 border-t pt-5">
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
  const [deleteCurrentPassword, setDeleteCurrentPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
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
      queryClient.clear();
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated. Please sign in again.' },
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      clearDeleteFields();
      queryClient.clear();
      navigate('/login', {
        replace: true,
        state: { message: 'Your account has been deleted.' },
      });
    },
  });

  const clearPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const clearDeleteFields = () => {
    setDeleteCurrentPassword('');
    setDeleteConfirmation('');
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
    clearDeleteFields();
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (!deleteUserMutation.isPending) {
      clearDeleteFields();
      deleteUserMutation.reset();
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmDeleteAccount = () => {
    deleteUserMutation.mutate({
      currentPassword: deleteCurrentPassword,
      confirmation: 'DELETE',
    });
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
  const isDeleteConfirmationValid = deleteConfirmation === 'DELETE';
  const canDeleteAccount = Boolean(
    deleteCurrentPassword &&
    isDeleteConfirmationValid &&
    !deleteUserMutation.isPending
  );

  if (isPending) {
    return <ProfileSkeleton />;
  }

  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="space-y-3">
          <h1 className="text-text-950 text-3xl font-bold">Account Settings</h1>
          <p className="text-text-700 text-base">
            Edit your account details and preferences.
          </p>
        </div>

        <section className="border-background-200 bg-background-50 rounded-2xl border p-6 shadow-lg sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6">
            <section className="border-background-200 border-b pb-6">
              <div className="space-y-1">
                <h2 className="text-text-950 text-base font-bold">Your Name</h2>
                <p className="text-text-700 text-sm">
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
                      className="border-background-300 text-text-700 hover:bg-background-100 rounded-md border px-4 py-2 text-sm font-bold transition"
                      onClick={resetNameChanges}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-text-50 hover:bg-primary-700 rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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
                    autoComplete="new-password"
                    minLength={4}
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
                  <PasswordRequirements password={newPassword} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-new-password">
                    Confirm new password
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={4}
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
                  <PasswordConfirmationStatus
                    password={newPassword}
                    confirmation={confirmNewPassword}
                    label="New passwords match"
                  />
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
                    className="border-background-300 text-text-700 hover:bg-background-100 rounded-md border px-4 py-2 text-sm font-bold transition"
                    onClick={closePasswordEditor}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-text-50 hover:bg-primary-700 rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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
              value={user?.email ?? ''}
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
                    className="border-background-300 text-text-700 hover:bg-background-100 rounded-md border px-4 py-2 text-sm font-bold transition"
                    onClick={closeEmailEditor}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-text-50 hover:bg-primary-700 rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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

            <section className="border-background-200 border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-text-950 text-base font-bold">
                    Delete Your Account
                  </h2>
                  <p className="text-text-700 text-sm">
                    Permanently remove your account and all Kitchen Keeps data.
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-primary-700 text-text-50 hover:bg-primary-600 w-fit rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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
          className="bg-text-950/50 fixed inset-0 z-50 flex items-center justify-center p-4"
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
            className="bg-background-50 w-full max-w-md rounded-2xl p-6 shadow-xl"
          >
            <div className="space-y-3">
              <h2
                id="delete-account-title"
                className="text-text-950 text-xl font-bold"
              >
                Delete your account?
              </h2>
              <p
                id="delete-account-description"
                className="text-text-700 text-sm"
              >
                This permanently removes your recipes, libraries, private
                ingredients, pantry items, prep lists, and managed images. This
                action cannot be undone.
              </p>
              {deleteUserMutation.isError && (
                <ErrorMessage message={deleteUserMutation.error.message} />
              )}
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="delete-account-password">
                  Current password
                </Label>
                <Input
                  id="delete-account-password"
                  type="password"
                  autoComplete="current-password"
                  value={deleteCurrentPassword}
                  onChange={(event) => {
                    setDeleteCurrentPassword(event.currentTarget.value);
                    deleteUserMutation.reset();
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="delete-account-confirmation">
                  Type DELETE to confirm
                </Label>
                <Input
                  id="delete-account-confirmation"
                  type="text"
                  autoComplete="off"
                  value={deleteConfirmation}
                  onChange={(event) => {
                    setDeleteConfirmation(event.currentTarget.value);
                    deleteUserMutation.reset();
                  }}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="border-background-300 text-text-700 hover:bg-background-100 rounded-md border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                onClick={closeDeleteDialog}
                disabled={deleteUserMutation.isPending}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-primary-700 text-text-50 hover:bg-primary-600 rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                onClick={confirmDeleteAccount}
                disabled={!canDeleteAccount}
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
