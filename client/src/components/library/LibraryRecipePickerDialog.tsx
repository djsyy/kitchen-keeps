import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { LuSearch, LuX } from 'react-icons/lu';
import ErrorMessage from '../ui/ErrorMessage';
import { RecipePickerSkeleton } from '../ui/LoadingSkeletons';
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
      className="bg-text-950/50 fixed inset-0 z-50 flex items-center justify-center p-4"
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
        className="bg-background-50 max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-text-500 text-sm font-bold tracking-wide uppercase">
              Collection
            </p>
            <h1
              id="library-recipe-picker-title"
              className="text-text-950 mt-1 text-2xl font-bold"
            >
              Add a recipe
            </h1>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="text-text-600 hover:bg-background-100 hover:text-text-950 rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-60"
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
          <LuSearch className="text-text-500 pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <input
            id="library-recipe-search"
            type="search"
            placeholder="Search your recipes..."
            className="border-background-300 bg-background-50 text-text-900 placeholder:text-text-400 focus:border-primary focus:ring-primary-100 w-full rounded-xl border py-3 pr-4 pl-11 text-sm shadow-sm transition outline-none focus:ring"
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
          <RecipePickerSkeleton />
        ) : availableRecipes.length > 0 ? (
          <ul className="divide-background-200 border-background-200 mt-5 divide-y rounded-xl border">
            {availableRecipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-text-950 truncate font-bold">
                    {recipe.title}
                  </p>
                  {recipe.description && (
                    <p className="text-text-600 mt-1 line-clamp-2 text-sm">
                      {recipe.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="bg-primary text-text-50 hover:bg-primary-700 shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPending}
                  onClick={() => onAdd(recipe.id)}
                >
                  {isPending ? 'Adding...' : 'Add'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-background-300 text-text-600 mt-6 rounded-xl border border-dashed px-4 py-8 text-center text-sm">
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
