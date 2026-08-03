import { LuCircleCheck, LuCircleX } from 'react-icons/lu';

type PasswordRequirementsProps = {
  password: string;
};

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const meetsMinimumLength = password.length >= 4;
  const StatusIcon = meetsMinimumLength ? LuCircleCheck : LuCircleX;

  return (
    <p
      aria-live="polite"
      className={`flex items-center gap-1.5 text-sm font-bold ${
        meetsMinimumLength ? 'text-secondary-800' : 'text-text-600'
      }`}
    >
      <StatusIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
      At least 4 characters
      <span className="sr-only">
        {meetsMinimumLength ? ' requirement met' : ' requirement not met'}
      </span>
    </p>
  );
}

type PasswordConfirmationStatusProps = {
  password: string;
  confirmation: string;
  label?: string;
};

export function PasswordConfirmationStatus({
  password,
  confirmation,
  label = 'Passwords match',
}: PasswordConfirmationStatusProps) {
  const passwordsMatch = password.length > 0 && password === confirmation;
  const StatusIcon = passwordsMatch ? LuCircleCheck : LuCircleX;

  return (
    <p
      aria-live="polite"
      className={`flex items-center gap-1.5 text-sm font-bold ${
        passwordsMatch ? 'text-secondary-800' : 'text-text-600'
      }`}
    >
      <StatusIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {label}
      <span className="sr-only">
        {passwordsMatch ? ' requirement met' : ' requirement not met'}
      </span>
    </p>
  );
}
