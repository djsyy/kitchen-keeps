import { LuClock3, LuPencil, LuUsersRound } from 'react-icons/lu';
import type { Recipe } from '../../services/recipeService';
import RecipeImagePlaceholder from './RecipeImagePlaceholder';

function formatCreatedDate(createdAt: string) {
  return `Created ${new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt))}`;
}

export default function RecipeOverviewCard({ recipe }: { recipe: Recipe }) {
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-background-300 bg-background-50 shadow-lg">
      <div className="grid lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] lg:items-stretch">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="relative z-10 h-64 w-full object-cover lg:h-full lg:min-h-80 lg:shadow-lg"
          />
        ) : (
          <RecipeImagePlaceholder
            className="relative z-10 h-64 w-full border-b border-background-300 lg:h-full lg:min-h-80 lg:border-r lg:border-b-0 lg:shadow-lg"
            iconClassName="h-12 w-12"
          />
        )}
        <div className="relative flex flex-col justify-center p-6 sm:p-8">
          <button
            type="button"
            aria-label="Edit recipe"
            className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-background-300 bg-background-50 text-text-700 shadow-sm transition hover:bg-background-100 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <LuPencil className="h-4 w-4" />
          </button>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-700">
            Your recipe
          </p>
          <h1 className="mt-1 pr-12 text-3xl font-bold text-text-950 sm:text-4xl">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-600">
              {recipe.description}
            </p>
          )}

          <div className="mt-6 grid gap-3 border-t border-background-200 pt-5 text-sm text-text-600 sm:grid-cols-2">
            {totalTime > 0 && (
              <p className="flex items-center gap-2 rounded-lg bg-background-50/70 px-3 py-2.5">
                <LuClock3 className="h-4 w-4 text-primary" />
                <span>{totalTime} minutes total</span>
              </p>
            )}
            {recipe.servings && (
              <p className="flex items-center gap-2 rounded-lg bg-background-50/70 px-3 py-2.5">
                <LuUsersRound className="h-4 w-4 text-primary" />
                <span>{recipe.servings} servings</span>
              </p>
            )}
            <p className="self-center px-1 text-text-500 sm:col-span-2">
              {formatCreatedDate(recipe.created_at)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
