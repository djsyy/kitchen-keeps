import Navbar from '../components/layout/Navbar';
import Input from '../components/ui/Input';
import { useCurrentUser } from '../hooks/useCurrentUser';

type SettingsRowProps = {
  title: string;
  description: string;
  inputId: string;
  inputType?: React.ComponentProps<'input'>['type'];
  placeholder: string;
  value?: string;
  disabled?: boolean;
  actionLabel?: string;
  hidden?: boolean;
};

function SettingsRow({
  title,
  description,
  inputId,
  inputType = 'text',
  placeholder,
  value,
  disabled = false,
  actionLabel,
  hidden = false,
}: SettingsRowProps) {
  if (hidden) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-b border-background-200 pb-6 last:border-b-0 last:pb-0">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-text-950">{title}</h2>
        <p className="text-sm text-text-700">{description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:max-w-xl">
        <Input
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          value={value ?? ''}
          readOnly
          disabled={disabled}
        />

        {actionLabel && (
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-background-300 px-4 py-2 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isPending } = useCurrentUser();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-text-950">Account Settings</h1>
          <p className="text-base text-text-700">
            Edit your name, email, password, and account preferences.
          </p>
        </div>

        <section className="rounded-2xl border border-background-200 bg-background-50 p-6 shadow-lg sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6">
            <SettingsRow
              title="Your Name"
              description="This is the name shown on your account."
              inputId="edit-name"
              placeholder={isPending ? 'Loading name...' : 'Current name'}
              value={user?.name}
            />

            <SettingsRow
              title="Your Password"
              description="Password changes should stay separate from your general profile updates."
              inputId="edit-password"
              inputType="password"
              placeholder="Current password"
              value="password"
              disabled
              actionLabel="Change"
            />

            <SettingsRow
              title="Confirm Password"
              description="This field can appear when the password update flow is active."
              inputId="edit-confirm-password"
              inputType="password"
              placeholder="Confirm password"
              hidden
            />

            <SettingsRow
              title="Your Email"
              description="This email is used for login and account recovery."
              inputId="edit-email"
              inputType="email"
              placeholder={isPending ? 'Loading email...' : 'Current email'}
              value={user?.email}
              disabled
              actionLabel="Change"
            />

            <div className="flex flex-col gap-3 border-b border-background-200 pb-6 last:border-b-0 last:pb-0">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-text-950">
                  Delete Your Account
                </h2>
                <p className="text-sm text-text-700">
                  This will remove all data related to your account.
                </p>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled
                >
                  Delete Account
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                className="rounded-md border border-background-300 px-4 py-2.5 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled
              >
                Save
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
