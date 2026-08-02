import { LuArrowRight, LuCarrot } from 'react-icons/lu';
import type { ActiveCookList } from './types';

type PrepListPanelProps = {
  activeCookList: ActiveCookList | null;
  onContinue: (cookSessionId: number) => void;
  onBrowseRecipes: () => void;
};

export default function PrepListPanel({
  activeCookList,
  onContinue,
  onBrowseRecipes,
}: PrepListPanelProps) {
  return (
    <aside className="space-y-4">
      <section>
        <div className="mb-4">
          <h2 className="text-text-950 text-2xl font-bold">Prep List</h2>
          <p className="text-text-500 text-sm">Temporary recipe prep.</p>
        </div>

        {activeCookList ? (
          <article className="border-secondary-200 bg-secondary-50 rounded-lg border p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <span className="bg-secondary-100 text-secondary-800 flex h-11 w-11 items-center justify-center rounded-lg">
                <LuCarrot className="h-5 w-5" />
              </span>
              <span className="bg-background-50 text-secondary-900 rounded-full px-3 py-1 text-sm font-bold">
                {activeCookList.remainingCount} left
              </span>
            </div>
            <h3 className="text-secondary-950 text-xl font-bold">
              {activeCookList.recipeTitle}
            </h3>
            <p className="text-secondary-900 mt-2 text-sm">
              {activeCookList.checkedCount} of {activeCookList.totalCount}{' '}
              checked
            </p>
            <button
              type="button"
              className="bg-secondary text-background-50 hover:bg-secondary-700 mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition"
              onClick={() => onContinue(activeCookList.id)}
            >
              Continue
              <LuArrowRight className="h-4 w-4" />
            </button>
          </article>
        ) : (
          <article className="border-background-200 bg-background-50 rounded-lg border p-5 shadow-sm">
            <span className="bg-background-100 text-text-700 mb-4 flex h-11 w-11 items-center justify-center rounded-lg">
              <LuCarrot className="h-5 w-5" />
            </span>
            <h3 className="text-text-950 text-xl font-bold">
              No active prep list
            </h3>
            <p className="text-text-600 mt-2 text-sm">
              No recipe checklist in progress.
            </p>
            <button
              type="button"
              className="border-text-200 bg-background-50 text-text-700 hover:border-text-300 hover:bg-background-100 mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold shadow-sm transition"
              onClick={onBrowseRecipes}
            >
              Browse recipes
              <LuArrowRight className="h-4 w-4" />
            </button>
          </article>
        )}
      </section>
    </aside>
  );
}
