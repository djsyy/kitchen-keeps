import { LuArrowUpRight } from 'react-icons/lu';
import type { QuickAction } from './types';

type QuickActionsProps = {
  actions: QuickAction[];
};

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section
      aria-label="Quick actions"
      className="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {actions.map((action) => {
        const ActionIcon = action.icon;

        return (
          <button
            key={action.label}
            type="button"
            className={`focus-visible:outline-primary group flex min-h-24 items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 ${action.className}`}
            onClick={action.onClick}
          >
            <span className="bg-background-50/70 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm">
              <ActionIcon aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{action.label}</span>
              <span className="mt-0.5 block text-sm font-normal opacity-80">
                {action.description}
              </span>
            </span>
            <LuArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        );
      })}
    </section>
  );
}
