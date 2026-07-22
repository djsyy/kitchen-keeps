import { useQuery } from '@tanstack/react-query';
import {
  LuArrowLeft,
  LuClock3,
  LuListChecks,
  LuNotebookPen,
  LuUsersRound,
} from 'react-icons/lu';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import { getRecipe } from '../services/recipeService';

function formatCreatedDate(createdAt: string) {
  return `Created ${new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt))}`;
}

const ingredientPreview = [
  { name: 'Olive oil', amount: '2 tbsp' },
  { name: 'Garlic', amount: '2 cloves' },
  { name: 'Tomatoes', amount: '1 can' },
  { name: 'Fresh basil', amount: '1 handful' },
];

export default function RecipePage() {
  const { id } = useParams();
  const recipeId = Number(id);
  const isValidRecipeId = Number.isInteger(recipeId) && recipeId > 0;
  const { data, error, isPending } = useQuery({
    queryKey: ['recipes', recipeId],
    queryFn: () => getRecipe(recipeId),
    enabled: isValidRecipeId,
  });
  const recipe = data?.data.recipe;
  const totalTime = recipe
    ? (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
    : 0;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-600 transition hover:text-text-950"
        >
          <LuArrowLeft className="h-4 w-4" />
          All recipes
        </Link>

        {!isValidRecipeId ? (
          <div className="mt-6">
            <ErrorMessage message="This recipe link is invalid." />
          </div>
        ) : isPending ? (
          <p className="mt-6 text-text-600">Loading recipe…</p>
        ) : error || !recipe ? (
          <div className="mt-6">
            <ErrorMessage message="We couldn’t load this recipe. Please try again." />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)]">
            <aside className="h-fit overflow-hidden rounded-3xl border border-background-300 bg-background-50 shadow-sm">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <div className="flex h-52 items-center justify-center bg-secondary-100 text-secondary-800">
                  <LuNotebookPen className="h-12 w-12" />
                </div>
              )}
              <div className="p-6">
                <h1 className="mt-5 text-3xl font-bold text-text-950">
                  {recipe.title}
                </h1>
                {recipe.description && (
                  <p className="mt-3 text-sm leading-6 text-text-600">
                    {recipe.description}
                  </p>
                )}

                <div className="mt-6 space-y-3 border-t border-background-200 pt-5 text-sm text-text-600">
                  {totalTime > 0 && (
                    <p className="flex items-center gap-2">
                      <LuClock3 className="h-4 w-4" />
                      {totalTime} minutes total
                    </p>
                  )}
                  {recipe.servings && (
                    <p className="flex items-center gap-2">
                      <LuUsersRound className="h-4 w-4" />
                      {recipe.servings} servings
                    </p>
                  )}
                  <p>{formatCreatedDate(recipe.created_at)}</p>
                </div>
              </div>
            </aside>

            <section className="rounded-3xl border border-background-300 bg-background-50 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-text-500">
                    Recipe essentials
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-text-950">
                    Ingredients
                  </h2>
                  <p className="mt-1 text-sm text-text-600">
                    Everything you’ll need before you start cooking.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
                >
                  <LuListChecks className="h-4 w-4" />
                  Create checklist
                </button>
              </div>

              <ul className="mt-8 divide-y divide-background-200 rounded-2xl border border-background-200 bg-white px-5">
                {ingredientPreview.map((ingredient) => (
                  <li
                    key={ingredient.name}
                    className="flex items-center justify-between gap-4 py-4 text-sm"
                  >
                    <span className="font-bold text-text-800">
                      {ingredient.name}
                    </span>
                    <span className="shrink-0 text-text-600">
                      {ingredient.amount}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm leading-6 text-text-500">
                Ingredient editing and checklist creation will connect here
                next.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
