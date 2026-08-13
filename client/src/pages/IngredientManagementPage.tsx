import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useMemo, useState } from 'react';
import { LuArchive, LuPencil, LuRotateCcw, LuSearch } from 'react-icons/lu';
import Navbar from '../components/layout/Navbar';
import IngredientArchiveDialog from '../components/ingredients/IngredientArchiveDialog';
import ErrorMessage from '../components/ui/ErrorMessage';
import { IngredientManagementSkeleton } from '../components/ui/LoadingSkeletons';
import {
  getManagedIngredients,
  hideIngredient,
  reactivateIngredient,
  updateIngredient,
  type Ingredient,
} from '../services/ingredientService';
import { queryKeys } from '../utils/queryKeys';

type IngredientStatus = 'active' | 'hidden';

export default function IngredientManagementPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<IngredientStatus>('active');
  const [search, setSearch] = useState('');
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [renameValue, setRenameValue] = useState('');
  const [archivingIngredient, setArchivingIngredient] =
    useState<Ingredient | null>(null);
  const ingredientsQuery = useQuery({
    queryKey: queryKeys.ingredients.manage(status),
    queryFn: () => getManagedIngredients({ status }),
  });
  const invalidateIngredientViews = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.ingredients.manage('active'),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.ingredients.manage('hidden'),
      }),
      queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pantry.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
    ]);
  const renameMutation = useMutation({
    mutationFn: ({
      ingredientId,
      name,
    }: {
      ingredientId: number;
      name: string;
    }) => updateIngredient(ingredientId, { name }),
    onSuccess: async () => {
      setEditingIngredient(null);
      setRenameValue('');
      await invalidateIngredientViews();
    },
  });
  const archiveMutation = useMutation({
    mutationFn: hideIngredient,
    onSuccess: async () => {
      setArchivingIngredient(null);
      await invalidateIngredientViews();
    },
  });
  const restoreMutation = useMutation({
    mutationFn: reactivateIngredient,
    onSuccess: invalidateIngredientViews,
  });

  const ingredients = ingredientsQuery.data?.data.ingredients ?? [];
  const visibleIngredients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) {
      return ingredients;
    }

    return ingredients.filter((ingredient) =>
      ingredient.name.toLocaleLowerCase().includes(normalizedSearch)
    );
  }, [ingredients, search]);
  const mutationError =
    renameMutation.error || archiveMutation.error || restoreMutation.error;

  const startEditing = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setRenameValue(ingredient.name);
    renameMutation.reset();
  };
  const submitRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingIngredient) {
      return;
    }

    renameMutation.mutate({
      ingredientId: editingIngredient.id,
      name: renameValue.trim(),
    });
  };

  if (ingredientsQuery.isPending) {
    return <IngredientManagementSkeleton />;
  }

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="max-w-2xl">
          <p className="text-primary text-sm font-bold tracking-wide uppercase">
            Kitchen Keeps
          </p>
          <h1 className="text-text-950 mt-1 text-3xl font-bold">
            My ingredients
          </h1>
          <p className="text-text-600 mt-3 leading-6">
            Manage private ingredients you created for your own recipes and
            Pantry. Shared ingredients cannot be changed here.
          </p>
        </header>

        {ingredientsQuery.isError ? (
          <ErrorMessage
            className="mt-8"
            message="We couldn’t load your private ingredients. Please try again."
          />
        ) : (
          <section className="border-background-300 bg-background-50 mt-8 rounded-2xl border p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-pressed={status === 'active'}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    status === 'active'
                      ? 'bg-primary text-text-50'
                      : 'text-text-700 hover:bg-background-100'
                  }`}
                  onClick={() => setStatus('active')}
                >
                  Active
                </button>
                <button
                  type="button"
                  aria-pressed={status === 'hidden'}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    status === 'hidden'
                      ? 'bg-primary text-text-50'
                      : 'text-text-700 hover:bg-background-100'
                  }`}
                  onClick={() => setStatus('hidden')}
                >
                  Archived
                </button>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <label className="sr-only" htmlFor="managed-ingredient-search">
                  Search private ingredients
                </label>
                <LuSearch className="text-text-500 pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  id="managed-ingredient-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                  placeholder="Search private ingredients..."
                  className="border-background-300 bg-background-50 text-text-950 focus:border-primary focus:ring-primary-100 w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none focus:ring"
                />
              </div>
            </div>

            {mutationError && (
              <ErrorMessage className="mt-5" message={mutationError.message} />
            )}

            {visibleIngredients.length > 0 ? (
              <ul className="divide-background-200 border-background-200 mt-6 divide-y rounded-xl border">
                {visibleIngredients.map((ingredient) => {
                  const isEditing = editingIngredient?.id === ingredient.id;
                  const isRestoring =
                    restoreMutation.isPending &&
                    restoreMutation.variables === ingredient.id;

                  return (
                    <li key={ingredient.id} className="px-4 py-3">
                      {isEditing ? (
                        <form
                          className="flex flex-col gap-3 sm:flex-row sm:items-center"
                          onSubmit={submitRename}
                        >
                          <label
                            className="sr-only"
                            htmlFor={`ingredient-${ingredient.id}`}
                          >
                            Ingredient name
                          </label>
                          <input
                            id={`ingredient-${ingredient.id}`}
                            autoFocus
                            required
                            maxLength={100}
                            value={renameValue}
                            onChange={(event) =>
                              setRenameValue(event.currentTarget.value)
                            }
                            className="border-background-300 bg-background-50 text-text-950 focus:border-primary focus:ring-primary-100 min-w-0 flex-1 rounded-lg border px-3 py-2 outline-none focus:ring"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={
                                renameMutation.isPending || !renameValue.trim()
                              }
                              className="bg-primary text-text-50 hover:bg-primary-700 rounded-lg px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {renameMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              disabled={renameMutation.isPending}
                              className="text-text-700 hover:bg-background-100 rounded-lg px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() => setEditingIngredient(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-text-950 min-w-0 truncate font-bold">
                            {ingredient.name}
                          </p>
                          {status === 'active' ? (
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                className="text-text-600 hover:bg-background-100 hover:text-primary rounded-md p-2 transition"
                                aria-label={`Rename ${ingredient.name}`}
                                onClick={() => startEditing(ingredient)}
                              >
                                <LuPencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="text-text-600 hover:bg-background-100 hover:text-primary rounded-md p-2 transition"
                                aria-label={`Archive ${ingredient.name}`}
                                onClick={() =>
                                  setArchivingIngredient(ingredient)
                                }
                              >
                                <LuArchive className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={restoreMutation.isPending}
                              className="text-primary hover:bg-primary-50 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() =>
                                restoreMutation.mutate(ingredient.id)
                              }
                            >
                              <LuRotateCcw className="h-4 w-4" />
                              {isRestoring ? 'Restoring...' : 'Restore'}
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="border-background-300 mt-6 rounded-xl border border-dashed px-5 py-10 text-center">
                <h2 className="text-text-950 font-bold">
                  {status === 'active'
                    ? 'No private ingredients yet'
                    : 'No archived ingredients'}
                </h2>
                <p className="text-text-600 mt-2 text-sm leading-6">
                  {status === 'active'
                    ? 'Private ingredients you create from a recipe or Pantry will appear here.'
                    : 'Archived ingredients can be restored whenever you need them again.'}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
      {archivingIngredient && (
        <IngredientArchiveDialog
          ingredient={archivingIngredient}
          isPending={archiveMutation.isPending}
          error={archiveMutation.error}
          onCancel={() => setArchivingIngredient(null)}
          onConfirm={() => archiveMutation.mutate(archivingIngredient.id)}
        />
      )}
    </main>
  );
}
