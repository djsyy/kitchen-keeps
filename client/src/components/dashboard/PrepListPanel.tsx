import { LuArrowRight, LuCarrot } from 'react-icons/lu';
import type { ActiveCookList } from './types';

type PrepListPanelProps = {
  activeCookList: ActiveCookList | null;
};

export default function PrepListPanel({ activeCookList }: PrepListPanelProps) {
  return (
    <aside className="space-y-4">
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-text-950">Prep List</h2>
          <p className="text-sm text-text-500">Temporary recipe prep.</p>
        </div>

        {activeCookList ? (
          <article className="rounded-lg border border-secondary-200 bg-secondary-50 p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-100 text-secondary-800">
                <LuCarrot className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-background-50 px-3 py-1 text-sm font-bold text-secondary-900">
                {activeCookList.remainingCount} left
              </span>
            </div>
            <h3 className="text-xl font-bold text-secondary-950">
              {activeCookList.recipeTitle}
            </h3>
            <p className="mt-2 text-sm text-secondary-900">
              {activeCookList.checkedCount} of {activeCookList.totalCount}{' '}
              checked
            </p>
            <button className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-sm font-bold text-background-50 shadow-sm transition hover:bg-secondary-700">
              Continue
              <LuArrowRight className="h-4 w-4" />
            </button>
          </article>
        ) : (
          <article className="rounded-lg border border-background-200 bg-background-50 p-5 shadow-sm">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-background-100 text-text-700">
              <LuCarrot className="h-5 w-5" />
            </span>
            <h3 className="text-xl font-bold text-text-950">
              No active prep list
            </h3>
            <p className="mt-2 text-sm text-text-600">
              No recipe checklist in progress.
            </p>
            <button className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-text-200 bg-background-50 px-4 text-sm font-bold text-text-700 shadow-sm transition hover:border-text-300 hover:bg-background-100">
              Browse recipes
              <LuArrowRight className="h-4 w-4" />
            </button>
          </article>
        )}
      </section>
    </aside>
  );
}
