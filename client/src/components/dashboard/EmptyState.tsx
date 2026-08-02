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
    <article className="border-background-300 bg-background-50 rounded-lg border border-dashed p-6 shadow-sm">
      <span className="bg-background-100 text-text-700 mb-4 flex h-11 w-11 items-center justify-center rounded-lg">
        <EmptyIcon className="h-5 w-5" />
      </span>
      <h3 className="text-text-950 text-xl font-bold">{title}</h3>
      <p className="text-text-600 mt-2 max-w-xl text-sm">{description}</p>
      <button className="bg-primary text-text-100 hover:bg-primary-700 mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition">
        <LuPlus className="h-4 w-4" />
        {actionLabel}
      </button>
    </article>
  );
}
