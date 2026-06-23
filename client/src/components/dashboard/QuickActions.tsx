import type { QuickAction } from './types';

type QuickActionsProps = {
  actions: QuickAction[];
};

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => {
        const ActionIcon = action.icon;

        return (
          <button
            key={action.label}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${action.className}`}
          >
            <ActionIcon className="h-4 w-4" />
            {action.label}
          </button>
        );
      })}
    </section>
  );
}
