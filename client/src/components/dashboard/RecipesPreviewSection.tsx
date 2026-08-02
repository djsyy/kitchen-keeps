import { LuArrowRight, LuBookOpen, LuFolderPlus, LuPlus } from 'react-icons/lu';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import type { RecipePreview } from './types';

type RecipesPreviewSectionProps = {
  recipes: RecipePreview[];
};

function RecipeRow({ recipe }: { recipe: RecipePreview }) {
  const RecipeIcon = recipe.icon;

  return (
    <article className="border-background-200 bg-background-50 grid gap-4 rounded-lg border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${recipe.iconClass}`}
      >
        <RecipeIcon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h3 className="text-text-950 truncate text-base font-bold">
          {recipe.title}
        </h3>
        <p className="text-text-500 mt-1 flex flex-wrap items-center gap-2 text-sm">
          <LuFolderPlus className="h-4 w-4" />
          {recipe.library}
          <span className="text-text-300">/</span>
          {recipe.lastOpened}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:justify-end">
        <span className="bg-background-100 text-text-700 inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-bold">
          {recipe.ingredientCount} ingredients
        </span>
        <button className="border-text-200 bg-background-50 text-text-700 hover:border-text-300 hover:bg-background-100 inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-bold shadow-sm transition">
          Open
        </button>
      </div>
    </article>
  );
}

function SectionActions() {
  return (
    <div className="flex gap-2">
      <button className="border-primary-200 bg-primary-100 text-primary-900 hover:border-primary-300 hover:bg-primary-200 inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold shadow-sm transition">
        <LuPlus className="h-4 w-4" />
        New
      </button>
      <button className="border-text-200 bg-background-50 text-text-700 hover:border-text-300 hover:bg-background-100 inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold shadow-sm transition">
        View all
        <LuArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function RecipesPreviewSection({
  recipes,
}: RecipesPreviewSectionProps) {
  return (
    <section>
      <SectionHeader
        title="Recipes"
        description="Recent activity from your recipes."
        actions={<SectionActions />}
      />

      {recipes.length > 0 ? (
        <div className="grid gap-4">
          {recipes.map((recipe) => (
            <RecipeRow key={recipe.title} recipe={recipe} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recipes yet"
          description="Add a recipe to start building your collection."
          actionLabel="Create Recipe"
          icon={LuBookOpen}
        />
      )}
    </section>
  );
}
