import { type MouseEvent, useEffect, useRef, useState } from 'react';
import {
  LuClock3,
  LuEllipsisVertical,
  LuNotebookPen,
  LuPlus,
  LuSearch,
  LuUsersRound,
} from 'react-icons/lu';
import type { Recipe } from '../../services/recipeService';

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
        <h1 className="text-2xl font-bold text-text-950">Your recipes</h1>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
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
        <LuSearch className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-text-500" />
        <input
          id="recipe-search"
          type="search"
          placeholder="Search recipes..."
          className="w-full rounded-2xl border border-background-300 bg-background-50 py-3 pr-4 pl-11 text-base text-text-900 shadow-sm outline-none transition placeholder:text-text-400 focus:border-primary focus:ring focus:ring-primary-100"
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
        <p className="rounded-2xl border border-dashed border-background-300 bg-background-50 px-5 py-8 text-center text-sm text-text-600">
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
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOptionsOpen) {
      return;
    }

    const closeOptionsOnOutsideClick = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOptionsOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOptionsOnOutsideClick);
  }, [isOptionsOpen]);

  return (
    <article
      ref={cardRef}
      className="relative cursor-pointer overflow-hidden rounded-2xl border border-background-300 bg-background-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onOpen(recipe)}
    >
      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-secondary-100 text-secondary-800">
          <LuNotebookPen className="h-9 w-9" />
        </div>
      )}
      <div className="p-5">
        <button
          type="button"
          aria-label={`Show options for ${recipe.title}`}
          aria-expanded={isOptionsOpen}
          aria-haspopup="menu"
          className="absolute top-3 right-3 rounded-md bg-background-50/90 p-1 text-text-600 transition hover:bg-background-100 hover:text-text-950"
          onClick={(event) => {
            event.stopPropagation();
            setIsOptionsOpen((isOpen) => !isOpen);
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
        <h2 className="text-xl font-bold text-text-950">{recipe.title}</h2>
        {recipe.description && (
          <p className="mt-2 text-sm leading-5 text-text-600">
            {recipe.description}
          </p>
        )}
        {(totalTime > 0 || recipe.servings) && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-600">
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
      className="absolute top-12 right-3 z-10 w-32 rounded-lg border border-background-300 bg-background-50 p-1 shadow-md"
    >
      <button
        type="button"
        role="menuitem"
        className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-text-700 transition hover:bg-background-100"
        onClick={(event) => handleAction(event, onEdit)}
      >
        Edit
      </button>
      <button
        type="button"
        role="menuitem"
        className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-primary transition hover:bg-primary-100"
        onClick={(event) => handleAction(event, onDelete)}
      >
        Delete
      </button>
    </div>
  );
}
