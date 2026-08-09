import { LuCircleCheck, LuCircleX } from 'react-icons/lu';

const minimumPasswordLength = 8;
const maximumPasswordBytes = 72;

type PasswordRequirementsProps = {
  password: string;
};

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const meetsMinimumLength = password.length >= minimumPasswordLength;
  const passwordByteLength = new TextEncoder().encode(password).length;
  const isWithinByteLimit = passwordByteLength <= maximumPasswordBytes;

  return (
    <div className="space-y-1" aria-live="polite">
      <PasswordRequirement
        isMet={meetsMinimumLength}
        label={`At least ${minimumPasswordLength} characters`}
      />
      {!isWithinByteLimit && (
        <PasswordRequirement isMet={false} label="Password is too long" />
      )}
    </div>
  );
}

function PasswordRequirement({
  isMet,
  label,
}: {
  isMet: boolean;
  label: string;
}) {
  const StatusIcon = isMet ? LuCircleCheck : LuCircleX;

  return (
    <p
      className={`flex items-center gap-1.5 text-sm font-bold ${
        isMet ? 'text-secondary-800' : 'text-text-600'
      }`}
    >
      <StatusIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {label}
      <span className="sr-only">
        {isMet ? ' requirement met' : ' requirement not met'}
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
