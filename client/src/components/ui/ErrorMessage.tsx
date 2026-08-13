import type { ComponentPropsWithoutRef } from 'react';
import { LuCircleAlert } from 'react-icons/lu';

type ErrorMessageProps = ComponentPropsWithoutRef<'p'> & {
  message: string;
};

export default function ErrorMessage({
  className,
  message,
  ...props
}: ErrorMessageProps) {
  return (
    <p
      role="alert"
      className={`flex gap-2 text-sm font-bold break-words text-red-700 ${className ?? ''}`}
      {...props}
    >
      <LuCircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}
