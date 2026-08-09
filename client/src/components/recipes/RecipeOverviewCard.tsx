import { LuClock3, LuPencil, LuUsersRound } from 'react-icons/lu';
import type { Recipe } from '../../services/recipeService';
import { getRecipeTotalTime } from '../../utils/recipeDisplay';
import RecipeImagePlaceholder from './RecipeImagePlaceholder';

function formatCreatedDate(createdAt: string) {
  return `Created ${new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt))}`;
}

export default function RecipeOverviewCard({
  recipe,
  onEdit,
}: {
  recipe: Recipe;
  onEdit: () => void;
}) {
  const totalTime = getRecipeTotalTime(recipe);

  return (
    <section className="border-background-300 bg-background-50 overflow-hidden rounded-2xl border shadow-lg">
      <div className="grid lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] lg:items-stretch">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="relative z-10 h-64 w-full object-cover lg:h-full lg:min-h-80 lg:shadow-lg"
          />
        ) : (
          <RecipeImagePlaceholder
            className="border-background-300 relative z-10 h-64 w-full border-b lg:h-full lg:min-h-80 lg:border-r lg:border-b-0 lg:shadow-lg"
            iconClassName="h-12 w-12"
          />
        )}
        <div className="relative flex flex-col justify-center p-6 sm:p-8">
          <button
            type="button"
            aria-label="Edit recipe"
            className="border-background-300 bg-background-50 text-text-700 hover:bg-background-100 hover:text-primary focus-visible:outline-primary absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={onEdit}
          >
            <LuPencil className="h-4 w-4" />
          </button>
          <p className="text-primary-700 text-sm font-bold tracking-[0.16em] uppercase">
            Your recipe
          </p>
          <h1 className="text-text-950 mt-1 pr-12 text-3xl font-bold sm:text-4xl">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="text-text-600 mt-3 max-w-xl text-sm leading-6">
              {recipe.description}
            </p>
          )}

          <div className="border-background-200 text-text-600 mt-6 grid gap-3 border-t pt-5 text-sm sm:grid-cols-2">
            {totalTime > 0 && (
              <p className="bg-background-50/70 flex items-center gap-2 rounded-lg px-3 py-2.5">
                <LuClock3 className="text-primary h-4 w-4" />
                <span>{totalTime} minutes total</span>
              </p>
            )}
            {recipe.servings && (
              <p className="bg-background-50/70 flex items-center gap-2 rounded-lg px-3 py-2.5">
                <LuUsersRound className="text-primary h-4 w-4" />
                <span>{recipe.servings} servings</span>
              </p>
            )}
            <p className="text-text-500 self-center px-1 sm:col-span-2">
              {formatCreatedDate(recipe.created_at)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
