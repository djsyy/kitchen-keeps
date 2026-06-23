import type { IconType } from 'react-icons';
import { LuPlus } from 'react-icons/lu';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  icon: IconType;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  icon: EmptyIcon,
}: EmptyStateProps) {
  return (
    <article className="rounded-lg border border-dashed border-background-300 bg-background-50 p-6 shadow-sm">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-background-100 text-text-700">
        <EmptyIcon className="h-5 w-5" />
      </span>
      <h3 className="text-xl font-bold text-text-950">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-text-600">{description}</p>
      <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-text-100 shadow-sm transition hover:bg-primary-700">
        <LuPlus className="h-4 w-4" />
        {actionLabel}
      </button>
    </article>
  );
}
