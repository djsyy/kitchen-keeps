import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useEffect, useState } from 'react';
import { LuBookOpen, LuPlus, LuSearch, LuX } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RecipeImagePlaceholder from '../components/recipes/RecipeImagePlaceholder';
import ErrorMessage from '../components/ui/ErrorMessage';
import {
  IngredientSearchSkeleton,
  PantrySkeleton,
} from '../components/ui/LoadingSkeletons';
import type { Ingredient } from '../services/ingredientService';
import { searchIngredients } from '../services/ingredientService';
import {
  addPantryItem,
  createPrivatePantryItem,
  getPantry,
  removePantryItem,
} from '../services/pantryService';
import { getRecipeTotalTime } from '../utils/recipeDisplay';
import { queryKeys } from '../utils/queryKeys';

export default function PantryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const normalizedSearch = search.trim();

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(normalizedSearch),
      250
    );
    return () => window.clearTimeout(timer);
  }, [normalizedSearch]);

  const pantryQuery = useQuery({
    queryKey: queryKeys.pantry.all,
    queryFn: getPantry,
  });
  const ingredientQuery = useQuery({
    queryKey: queryKeys.ingredients.search(debouncedSearch),
    queryFn: () => searchIngredients(debouncedSearch),
    enabled: isSearchOpen && debouncedSearch.length >= 2,
  });
  const invalidatePantry = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pantry.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
    ]);
  const addItemMutation = useMutation({
    mutationFn: addPantryItem,
    onSuccess: async () => {
      setSearch('');
      setSelectedIngredient(null);
      setIsSearchOpen(false);
      await invalidatePantry();
    },
  });
  const createPrivateItemMutation = useMutation({
    mutationFn: createPrivatePantryItem,
    onSuccess: async () => {
      setSearch('');
      setSelectedIngredient(null);
      setIsSearchOpen(false);
      await invalidatePantry();
    },
  });
  const removeItemMutation = useMutation({
    mutationFn: removePantryItem,
    onSuccess: invalidatePantry,
  });

  if (pantryQuery.isPending) {
    return <PantrySkeleton />;
  }

  const pantry = pantryQuery.data?.data;
  const matchingIngredients = ingredientQuery.data?.data.ingredients ?? [];
  const hasExactMatch = matchingIngredients.some(
    (ingredient) =>
      ingredient.name.toLocaleLowerCase() ===
      normalizedSearch.toLocaleLowerCase()
  );
  const canCreatePrivateIngredient =
    normalizedSearch.length > 0 && normalizedSearch.length <= 100;
  const mutationError =
    addItemMutation.error ||
    createPrivateItemMutation.error ||
    removeItemMutation.error;

  const selectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setSearch(ingredient.name);
    setIsSearchOpen(false);
  };
  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedIngredient) {
      addItemMutation.mutate(selectedIngredient.id);
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="max-w-2xl">
          <p className="text-primary text-sm font-bold tracking-wide uppercase">
            Kitchen Keeps
          </p>
          <h1 className="text-text-950 mt-1 text-3xl font-bold">Your pantry</h1>
          <p className="text-text-600 mt-3 leading-6">
            Keep a simple list of ingredients you have. Update it whenever your
            kitchen changes to see recipes you can make now.
          </p>
        </header>

        {pantryQuery.isError || !pantry ? (
          <ErrorMessage
            className="mt-8"
            message="We couldn’t load your pantry. Please try again."
          />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <section className="border-background-300 bg-background-50 rounded-2xl border p-6 shadow-sm">
              <div>
                <h2 className="text-text-950 text-xl font-bold">
                  Ingredients you have
                </h2>
                <p className="text-text-600 mt-1 text-sm">
                  Add ingredients from the shared list or create a private one.
                </p>
              </div>

              <form className="mt-5" onSubmit={handleAdd}>
                <div className="relative">
                  <label className="sr-only" htmlFor="pantry-ingredient-search">
                    Search ingredients
                  </label>
                  <LuSearch className="text-text-500 pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                  <input
                    id="pantry-ingredient-search"
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls="pantry-ingredient-results"
                    aria-expanded={isSearchOpen && normalizedSearch.length >= 2}
                    className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 w-full rounded-lg border bg-white py-3 pr-32 pl-10 outline-none focus:ring"
                    placeholder="Search ingredients..."
                    value={search}
                    onFocus={() => setIsSearchOpen(true)}
                    onBlur={() => setIsSearchOpen(false)}
                    onChange={(event) => {
                      setSearch(event.currentTarget.value);
                      setSelectedIngredient(null);
                      setIsSearchOpen(true);
                      addItemMutation.reset();
                      createPrivateItemMutation.reset();
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!selectedIngredient || addItemMutation.isPending}
                    className="bg-primary text-text-50 hover:bg-primary-700 absolute top-1/2 right-1.5 inline-flex h-10 -translate-y-1/2 items-center gap-1 rounded-md px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LuPlus className="h-4 w-4" />
                    {addItemMutation.isPending ? 'Adding...' : 'Add'}
                  </button>
                  {isSearchOpen && normalizedSearch.length >= 2 && (
                    <div
                      id="pantry-ingredient-results"
                      role="listbox"
                      className="border-background-300 bg-background-50 absolute top-full z-10 mt-1 w-full overflow-hidden rounded-lg border py-1 shadow-lg"
                    >
                      {ingredientQuery.isFetching ? (
                        <IngredientSearchSkeleton />
                      ) : ingredientQuery.isError ? (
                        <p className="text-text-600 px-3 py-2 text-sm">
                          We couldn’t search ingredients. Try again.
                        </p>
                      ) : (
                        <>
                          {matchingIngredients.map((ingredient) => (
                            <button
                              key={ingredient.id}
                              type="button"
                              role="option"
                              aria-selected={
                                selectedIngredient?.id === ingredient.id
                              }
                              className="text-text-950 hover:bg-background-100 flex w-full items-center justify-between px-3 py-2 text-left text-sm transition"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => selectIngredient(ingredient)}
                            >
                              <span>{ingredient.name}</span>
                              {ingredient.created_by_user_id !== null && (
                                <span className="text-text-500 text-xs">
                                  Your ingredient
                                </span>
                              )}
                            </button>
                          ))}
                          {!hasExactMatch && (
                            <button
                              type="button"
                              disabled={
                                !canCreatePrivateIngredient ||
                                createPrivateItemMutation.isPending
                              }
                              className="border-background-200 text-primary hover:bg-primary-50 w-full border-t px-3 py-2 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() =>
                                createPrivateItemMutation.mutate(
                                  normalizedSearch
                                )
                              }
                            >
                              {createPrivateItemMutation.isPending
                                ? 'Adding private ingredient…'
                                : `Add “${normalizedSearch}” as a private ingredient`}
                            </button>
                          )}
                          {matchingIngredients.length === 0 &&
                            !hasExactMatch && (
                              <p className="text-text-500 px-3 pb-2 text-sm">
                                No matching ingredients found.
                              </p>
                            )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {mutationError && (
                <ErrorMessage
                  className="mt-4"
                  message={mutationError.message}
                />
              )}

              {pantry.pantryItems.length > 0 ? (
                <ul className="divide-background-200 border-background-200 mt-6 divide-y rounded-xl border">
                  {pantry.pantryItems.map((item) => {
                    const isRemoving =
                      removeItemMutation.isPending &&
                      removeItemMutation.variables === item.ingredient_id;

                    return (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div>
                          <p className="text-text-950 font-bold">{item.name}</p>
                          {item.created_by_user_id !== null && (
                            <p className="text-text-500 mt-0.5 text-xs">
                              Private ingredient
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from pantry`}
                          disabled={removeItemMutation.isPending}
                          className="text-text-500 hover:bg-background-100 hover:text-primary rounded-md p-2 transition disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() =>
                            removeItemMutation.mutate(item.ingredient_id)
                          }
                        >
                          <LuX className="h-5 w-5" />
                          <span className="sr-only">
                            {isRemoving ? 'Removing...' : 'Remove'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="border-background-300 mt-6 rounded-xl border border-dashed px-5 py-10 text-center">
                  <LuBookOpen className="text-text-500 mx-auto h-7 w-7" />
                  <h3 className="text-text-950 mt-3 font-bold">
                    Your pantry is empty
                  </h3>
                  <p className="text-text-600 mt-1 text-sm leading-6">
                    Add ingredients you have to start finding makeable recipes.
                  </p>
                </div>
              )}
            </section>

            <section className="border-background-300 bg-background-50 rounded-2xl border p-6 shadow-sm">
              <h2 className="text-text-950 text-xl font-bold">
                You can make these
              </h2>
              <p className="text-text-600 mt-1 text-sm leading-6">
                These recipes use only ingredients currently in your pantry.
              </p>

              {(pantry.recommendationEligibility.unlinkedRecipeCount > 0 ||
                pantry.recommendationEligibility.archivedIngredientRecipeCount >
                  0) && (
                <div className="border-olive-green-200 bg-olive-green-50 text-olive-green-900 mt-5 rounded-xl border px-4 py-3 text-sm leading-5">
                  {pantry.recommendationEligibility.unlinkedRecipeCount > 0 && (
                    <div>
                      <p className="font-bold">
                        {pantry.recommendationEligibility.unlinkedRecipeCount}{' '}
                        {pantry.recommendationEligibility
                          .unlinkedRecipeCount === 1
                          ? 'recipe needs an ingredient link'
                          : 'recipes need ingredient links'}
                      </p>
                      <p className="mt-1">
                        Select or create ingredients while editing those recipes
                        to include them in verified recommendations.
                      </p>
                      <Link
                        to="/recipes"
                        className="text-primary mt-2 inline-flex font-bold underline underline-offset-2"
                      >
                        Review recipes
                      </Link>
                    </div>
                  )}
                  {pantry.recommendationEligibility
                    .archivedIngredientRecipeCount > 0 && (
                    <div
                      className={
                        pantry.recommendationEligibility.unlinkedRecipeCount > 0
                          ? 'border-olive-green-200 mt-3 border-t pt-3'
                          : ''
                      }
                    >
                      <p className="font-bold">
                        {
                          pantry.recommendationEligibility
                            .archivedIngredientRecipeCount
                        }{' '}
                        {pantry.recommendationEligibility
                          .archivedIngredientRecipeCount === 1
                          ? 'recipe uses an archived ingredient'
                          : 'recipes use archived ingredients'}
                      </p>
                      <p className="mt-1">
                        Restore an ingredient or replace it in the affected
                        recipe to make it eligible again.
                      </p>
                      <Link
                        to="/ingredients"
                        className="text-primary mt-2 inline-flex font-bold underline underline-offset-2"
                      >
                        Manage ingredients
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {pantry.recommendations.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {pantry.recommendations.map((recipe) => {
                    const totalTime = getRecipeTotalTime(recipe);

                    return (
                      <Link
                        key={recipe.id}
                        to={`/recipes/${recipe.id}`}
                        className="border-background-200 hover:bg-background-100 group flex items-center gap-3 rounded-xl border p-3 transition"
                      >
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="h-16 w-20 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <RecipeImagePlaceholder
                            className="h-16 w-20 shrink-0 rounded-lg"
                            iconClassName="h-5 w-5"
                          />
                        )}
                        <div className="min-w-0">
                          <h3 className="text-text-950 group-hover:text-primary truncate font-bold transition">
                            {recipe.title}
                          </h3>
                          {totalTime > 0 && (
                            <p className="text-text-600 mt-1 text-sm">
                              {totalTime} min
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="border-background-300 mt-6 rounded-xl border border-dashed px-5 py-10 text-center">
                  <h3 className="text-text-950 font-bold">
                    No verified matches yet
                  </h3>
                  <p className="text-text-600 mt-2 text-sm leading-6">
                    Recommendations appear when every selected ingredient in one
                    of your recipes is in your pantry.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
