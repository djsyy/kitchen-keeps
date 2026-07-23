import { LuClock3, LuNotebookPen, LuUsersRound } from 'react-icons/lu';
import type { Recipe } from '../../services/recipeService';

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
        <h1 className="text-3xl font-bold text-text-950">{recipe.title}</h1>
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
  );
}
