import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { LuSearch, LuX } from 'react-icons/lu';
import ErrorMessage from '../ui/ErrorMessage';
import { getRecipes } from '../../services/recipeService';
import { queryKeys } from '../../utils/queryKeys';

type LibraryRecipePickerDialogProps = {
  memberRecipeIds: number[];
  isPending: boolean;
  error: Error | null;
  onAdd: (recipeId: number) => void;
  onClose: () => void;
};

export default function LibraryRecipePickerDialog({
  memberRecipeIds,
  isPending,
  error,
  onAdd,
  onClose,
}: LibraryRecipePickerDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data,
    error: recipesError,
    isPending: areRecipesPending,
  } = useQuery({
    queryKey: queryKeys.recipes.all,
    queryFn: getRecipes,
  });
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const memberRecipeIdSet = new Set(memberRecipeIds);
  const recipes = data?.data.recipes ?? [];
  const availableRecipes = recipes.filter(
    (recipe) =>
      !memberRecipeIdSet.has(recipe.id) &&
      [recipe.title, recipe.description]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearchTerm))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-recipe-picker-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-background-50 p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-text-500">
              Collection
            </p>
            <h1
              id="library-recipe-picker-title"
              className="mt-1 text-2xl font-bold text-text-950"
            >
              Add a recipe
            </h1>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-lg p-2 text-text-600 transition hover:bg-background-100 hover:text-text-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onClose}
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-5">
          <label className="sr-only" htmlFor="library-recipe-search">
            Search recipes
          </label>
          <LuSearch className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-text-500" />
          <input
            id="library-recipe-search"
            type="search"
            placeholder="Search your recipes..."
            className="w-full rounded-xl border border-background-300 bg-background-50 py-3 pr-4 pl-11 text-sm text-text-900 shadow-sm outline-none transition placeholder:text-text-400 focus:border-primary focus:ring focus:ring-primary-100"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            autoFocus
          />
        </div>

        {(error || recipesError) && (
          <ErrorMessage
            className="mt-4"
            message={
              error?.message ??
              recipesError?.message ??
              'Unable to load recipes.'
            }
          />
        )}

        {areRecipesPending ? (
          <p className="mt-6 text-sm text-text-600">Loading recipes…</p>
        ) : availableRecipes.length > 0 ? (
          <ul className="mt-5 divide-y divide-background-200 rounded-xl border border-background-200">
            {availableRecipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-text-950">
                    {recipe.title}
                  </p>
                  {recipe.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-text-600">
                      {recipe.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPending}
                  onClick={() => onAdd(recipe.id)}
                >
                  {isPending ? 'Adding...' : 'Add'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-background-300 px-4 py-8 text-center text-sm text-text-600">
            {searchTerm
              ? `No recipes match “${searchTerm}”.`
              : recipes.length === 0
                ? 'You have not created any recipes yet.'
                : 'All of your recipes are already in this library.'}
          </p>
        )}
      </section>
    </div>
  );
}
