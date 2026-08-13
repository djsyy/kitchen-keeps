import { type MouseEvent, useState } from 'react';
import {
  LuClock3,
  LuEllipsisVertical,
  LuPlus,
  LuSearch,
  LuUsersRound,
} from 'react-icons/lu';
import type { Recipe } from '../../services/recipeService';
import { getRecipeTotalTime } from '../../utils/recipeDisplay';
import useCardOptionsMenu from '../../hooks/useCardOptionsMenu';
import RecipeImagePlaceholder from './RecipeImagePlaceholder';

type RecipeGridProps = {
  recipes: Recipe[];
  onCreate: () => void;
  onOpen: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
};

export default function RecipeGrid({
  recipes,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
}: RecipeGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visibleRecipes = recipes.filter((recipe) =>
    [recipe.title, recipe.description]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedSearchTerm))
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-text-950 text-2xl font-bold">Your recipes</h1>
        <button
          type="button"
          className="bg-primary text-text-50 hover:bg-primary-700 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition"
          onClick={onCreate}
        >
          <LuPlus className="h-4 w-4" />
          Create a recipe
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <label className="sr-only" htmlFor="recipe-search">
          Search recipes
        </label>
        <LuSearch className="text-text-500 pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        <input
          id="recipe-search"
          type="search"
          placeholder="Search recipes..."
          className="border-background-300 bg-background-50 text-text-900 placeholder:text-text-400 focus:border-primary focus:ring-primary-100 w-full rounded-2xl border py-3 pr-4 pl-11 text-base shadow-sm transition outline-none focus:ring"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
        />
      </div>

      {visibleRecipes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <p className="border-background-300 bg-background-50 text-text-600 rounded-2xl border border-dashed px-5 py-8 text-center text-sm">
          No recipes match “{searchTerm}”.
        </p>
      )}
    </section>
  );
}

function RecipeCard({
  recipe,
  onOpen,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}) {
  const totalTime = getRecipeTotalTime(recipe);
  const { containerRef, isOptionsOpen, toggleOptions } =
    useCardOptionsMenu<HTMLElement>();

  return (
    <article
      ref={containerRef}
      className="border-background-300 bg-background-50 relative cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onOpen(recipe)}
    >
      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <RecipeImagePlaceholder
          className="h-40 w-full"
          iconClassName="h-9 w-9"
        />
      )}
      <div className="p-5">
        <button
          type="button"
          aria-label={`Show options for ${recipe.title}`}
          aria-expanded={isOptionsOpen}
          aria-haspopup="menu"
          className="bg-background-50/90 text-text-600 hover:bg-background-100 hover:text-text-950 focus-visible:outline-primary absolute top-3 right-3 rounded-md p-1 shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={(event) => {
            event.stopPropagation();
            toggleOptions();
          }}
        >
          <LuEllipsisVertical className="h-5 w-5" />
        </button>
        {isOptionsOpen && (
          <RecipeCardOptions
            onEdit={() => onEdit(recipe)}
            onDelete={() => onDelete(recipe)}
          />
        )}
        <h2 className="text-text-950 text-xl font-bold break-words">
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="text-text-600 mt-2 text-sm leading-5 break-words">
            {recipe.description}
          </p>
        )}
        {(totalTime > 0 || recipe.servings) && (
          <div className="text-text-600 mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {totalTime > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <LuClock3 className="h-4 w-4" />
                {totalTime} min
              </span>
            )}
            {recipe.servings && (
              <span className="inline-flex items-center gap-1.5">
                <LuUsersRound className="h-4 w-4" />
                {recipe.servings} servings
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function RecipeCardOptions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const handleAction = (
    event: MouseEvent<HTMLButtonElement>,
    action: () => void
  ) => {
    event.stopPropagation();
    action();
  };

  return (
    <div
      role="menu"
      className="border-background-300 bg-background-50 absolute top-12 right-3 z-10 w-32 rounded-lg border p-1 shadow-md"
    >
      <button
        type="button"
        role="menuitem"
        className="text-text-700 hover:bg-background-100 w-full rounded-md px-3 py-2 text-left text-sm font-bold transition"
        onClick={(event) => handleAction(event, onEdit)}
      >
        Edit
      </button>
      <button
        type="button"
        role="menuitem"
        className="text-primary hover:bg-primary-100 w-full rounded-md px-3 py-2 text-left text-sm font-bold transition"
        onClick={(event) => handleAction(event, onDelete)}
      >
        Delete
      </button>
    </div>
  );
}
