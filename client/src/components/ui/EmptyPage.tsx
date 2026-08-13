import type { IconType } from 'react-icons';
import { LuPlus } from 'react-icons/lu';

interface EmptyPageProps {
  icon: IconType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyPage({
  icon: Icon,
  title,
  description,
  action,
}: EmptyPageProps) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
      <article className="border-background-300 bg-background-50 mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-dashed px-6 py-12 text-center shadow-sm sm:px-10">
        <span className="bg-olive-green-100 text-olive-green-800 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="text-text-950 text-2xl font-bold">{title}</h1>
        <p className="text-text-600 mt-3 max-w-md text-base">{description}</p>
        {action && (
          <button
            type="button"
            className="bg-primary text-text-50 hover:bg-primary-700 mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition"
            onClick={action.onClick}
          >
            <LuPlus className="h-4 w-4" />
            {action.label}
          </button>
        )}
      </article>
    </section>
  );
}
