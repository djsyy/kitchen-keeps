import { PiUserCircleThin } from 'react-icons/pi';
import type { IconType } from 'react-icons';
import {
  LuArchive,
  LuArrowRight,
  LuBookOpen,
  LuCarrot,
  LuChefHat,
  LuClock3,
  LuFolderPlus,
  LuPlus,
  LuSearch,
  LuSoup,
  LuUtensils,
} from 'react-icons/lu';

type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  className: string;
};

type QuickAction = {
  label: string;
  icon: IconType;
  className: string;
};

type RecipePreview = {
  title: string;
  library: string;
  lastOpened: string;
  ingredientCount: number;
  icon: IconType;
  iconClass: string;
};

type LibraryPreview = {
  title: string;
  description: string;
  recipeCount: number;
  updatedAt: string;
  icon: IconType;
  iconClass: string;
  borderClass: string;
};

type ActiveCookList = {
  recipeTitle: string;
  checkedCount: number;
  totalCount: number;
  remainingCount: number;
};

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  icon: IconType;
};

// DEMO
// Top-level dashboard counts shown as a quick snapshot.
const dashboardMetrics: DashboardMetric[] = [
  {
    label: 'Recipes',
    value: '124',
    detail: '9 opened this week',
    className: 'border-secondary-200 bg-secondary-50 text-secondary-900',
  },
  {
    label: 'Libraries',
    value: '28',
    detail: '4 recently updated',
    className: 'border-accent-200 bg-accent-50 text-accent-900',
  },
  {
    label: 'Ingredients',
    value: '312',
    detail: 'Across all recipes',
    className: 'border-primary-100 bg-primary-50 text-primary-900',
  },
];

// Primary dashboard actions for core recipe and library tasks.
const quickActions: QuickAction[] = [
  {
    label: 'New Recipe',
    icon: LuBookOpen,
    className: 'bg-primary text-text-100 hover:bg-primary-700',
  },
  {
    label: 'Create Library',
    icon: LuFolderPlus,
    className:
      'border border-accent-300 bg-accent-50 text-accent-900 hover:bg-accent-100',
  },
  {
    label: 'Browse Recipes',
    icon: LuSearch,
    className:
      'border border-secondary-300 bg-secondary-50 text-secondary-900 hover:bg-secondary-100',
  },
];

// DEMO
// Recently used recipes are the main dashboard preview.
const recipePreviews: RecipePreview[] = [
  {
    title: 'Roasted Carrot Soup',
    library: 'Soups & Stews',
    lastOpened: 'Opened today',
    ingredientCount: 9,
    icon: LuSoup,
    iconClass: 'bg-accent-100 text-accent-800',
  },
  {
    title: 'Garlic Herb Chicken Bowls',
    library: 'Weeknight Dinners',
    lastOpened: 'Cooked yesterday',
    ingredientCount: 12,
    icon: LuUtensils,
    iconClass: 'bg-secondary-100 text-secondary-800',
  },
  {
    title: 'Chickpea Tomato Skillet',
    library: 'Simple Staples',
    lastOpened: 'Opened 3 days ago',
    ingredientCount: 8,
    icon: LuArchive,
    iconClass: 'bg-primary-50 text-primary-800',
  },
];

// DEMO
// A short preview of the user's larger library collection.
const libraryPreviews: LibraryPreview[] = [
  {
    title: 'Weeknight Dinners',
    description: 'Reliable meals for busy evenings and leftovers.',
    recipeCount: 26,
    updatedAt: 'Updated today',
    icon: LuUtensils,
    iconClass: 'bg-secondary-100 text-secondary-800',
    borderClass: 'border-secondary-300',
  },
  {
    title: 'Soups & Stews',
    description: 'Cold-weather bowls, broths, and freezer staples.',
    recipeCount: 18,
    updatedAt: 'Updated yesterday',
    icon: LuSoup,
    iconClass: 'bg-accent-100 text-accent-800',
    borderClass: 'border-accent-300',
  },
  {
    title: 'Simple Staples',
    description: 'Flexible recipes with short ingredient lists.',
    recipeCount: 14,
    updatedAt: 'Updated 2 days ago',
    icon: LuArchive,
    iconClass: 'bg-primary-50 text-primary-800',
    borderClass: 'border-primary-200',
  },
];

// Null represents the default state when no recipe checklist is in progress.
const activeCookList: ActiveCookList | null = null;

function EmptyState({
  title,
  description,
  actionLabel,
  icon: EmptyIcon,
}: EmptyStateProps) {
  return (
    <article className="rounded-lg border border-dashed border-background-300 bg-background-50 p-6 shadow-sm">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-background-100 text-text-700">
        <EmptyIcon className="h-5 w-5" />
      </span>
      <h3 className="text-xl font-bold text-text-950">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-text-600">{description}</p>
      <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-text-100 shadow-sm transition hover:bg-primary-700">
        <LuPlus className="h-4 w-4" />
        {actionLabel}
      </button>
    </article>
  );
}

export default function DashboardPage() {
  const hasRecipes = recipePreviews.length > 0;
  const hasLibraries = libraryPreviews.length > 0;

  return (
    <main className="min-h-screen bg-background">
      {/* Header / top navigation */}
      <header className="border-b border-background-200 bg-background-50/90 shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-text-100 shadow-sm">
              <LuChefHat className="h-7 w-7" />
            </span>
            <div>
              <span className="block text-2xl font-bold text-text-950">
                What&apos;s Cooking?
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-base font-bold text-text-700 sm:block">
              Hi User!
            </span>
            <button
              className="rounded-lg border border-primary-100 bg-white/60 p-2 text-primary shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
              aria-label="Open profile menu"
            >
              <PiUserCircleThin className="h-8 w-8" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Dashboard hero and stats */}
        <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] xl:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1 text-sm font-bold text-secondary-800">
              <LuUtensils className="h-4 w-4" />
              Dashboard
            </p>
            <h1 className="mb-3 max-w-3xl text-3xl font-bold text-text-950">
              Find Your Next Meal
            </h1>
            <p className="max-w-2xl text-base text-text-600">
              Organize recipes and plan ahead.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {dashboardMetrics.map((metric) => (
              <article
                key={metric.label}
                className={`rounded-lg border-2 p-4 shadow-md ${metric.className}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-md font-bold">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <p className="mt-1 text-md">{metric.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Quick action buttons */}
        <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;

            return (
              <button
                key={action.label}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${action.className}`}
              >
                <ActionIcon className="h-4 w-4" />
                {action.label}
              </button>
            );
          })}
        </section>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
          <div className="space-y-10">
            {/* Recipes preview section */}
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-text-950">Recipes</h2>
                  <p className="text-sm text-text-500">
                    Recent activity from your recipes.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 text-sm font-bold text-primary-900 shadow-sm transition hover:border-primary-300 hover:bg-primary-100">
                    <LuPlus className="h-4 w-4" />
                    New
                  </button>
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-text-200 bg-background-50 px-3 text-sm font-bold text-text-700 shadow-sm transition hover:border-text-300 hover:bg-background-100">
                    View all
                    <LuArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {hasRecipes ? (
                <div className="grid gap-4">
                  {recipePreviews.map((recipe) => {
                    const RecipeIcon = recipe.icon;

                    return (
                      <article
                        key={recipe.title}
                        className="grid gap-4 rounded-lg border border-background-200 bg-background-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                      >
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${recipe.iconClass}`}
                        >
                          <RecipeIcon className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-text-950">
                            {recipe.title}
                          </h3>
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-500">
                            <LuFolderPlus className="h-4 w-4" />
                            {recipe.library}
                            <span className="text-text-300">/</span>
                            {recipe.lastOpened}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end">
                          <span className="inline-flex h-9 items-center justify-center rounded-full bg-background-100 px-3 text-sm font-bold text-text-700">
                            {recipe.ingredientCount} ingredients
                          </span>
                          <button className="inline-flex h-9 items-center justify-center rounded-lg border border-text-200 bg-background-50 px-3 text-sm font-bold text-text-700 shadow-sm transition hover:border-text-300 hover:bg-background-100">
                            Open
                          </button>
                        </div>
                      </article>
                    );
                  })}
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

            {/* Libraries preview section */}
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-text-950">
                    Libraries
                  </h2>
                  <p className="text-sm text-text-500">
                    Recently updated collections.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 text-sm font-bold text-primary-900 shadow-sm transition hover:border-primary-300 hover:bg-primary-100">
                    <LuPlus className="h-4 w-4" />
                    New
                  </button>
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-text-200 bg-background-50 px-3 text-sm font-bold text-text-700 shadow-sm transition hover:border-text-300 hover:bg-background-100">
                    View all
                    <LuArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {hasLibraries ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {libraryPreviews.map((library) => {
                    const LibraryIcon = library.icon;

                    return (
                      <article
                        key={library.title}
                        className={`rounded-lg border bg-background-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${library.borderClass}`}
                      >
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${library.iconClass}`}
                          >
                            <LibraryIcon className="h-5 w-5" />
                          </span>
                          <span className="rounded-full bg-background-100 px-3 py-1 text-sm font-bold text-text-700">
                            {library.recipeCount}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-text-950">
                          {library.title}
                        </h3>
                        <p className="mt-2 min-h-10 text-sm text-text-600">
                          {library.description}
                        </p>
                        <p className="mt-5 flex items-center gap-2 text-sm font-bold text-text-500">
                          <LuClock3 className="h-4 w-4" />
                          {library.updatedAt}
                        </p>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No libraries yet"
                  description="Create a library when you want to group recipes."
                  actionLabel="Create Library"
                  icon={LuFolderPlus}
                />
              )}
            </section>
          </div>

          {/* Active cook list section */}
          <aside className="space-y-4">
            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-text-950">Prep List</h2>
                <p className="text-sm text-text-500">Temporary recipe prep.</p>
              </div>

              {activeCookList ? (
                <article className="rounded-lg border border-secondary-200 bg-secondary-50 p-5 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-100 text-secondary-800">
                      <LuCarrot className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-background-50 px-3 py-1 text-sm font-bold text-secondary-900">
                      {activeCookList.remainingCount} left
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary-950">
                    {activeCookList.recipeTitle}
                  </h3>
                  <p className="mt-2 text-sm text-secondary-900">
                    {activeCookList.checkedCount} of {activeCookList.totalCount}{' '}
                    checked
                  </p>
                  <button className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-sm font-bold text-background-50 shadow-sm transition hover:bg-secondary-700">
                    Continue
                    <LuArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ) : (
                <article className="rounded-lg border border-background-200 bg-background-50 p-5 shadow-sm">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-background-100 text-text-700">
                    <LuCarrot className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold text-text-950">
                    No active prep list
                  </h3>
                  <p className="mt-2 text-sm text-text-600">
                    No recipe checklist in progress.
                  </p>
                  <button className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-text-200 bg-background-50 px-4 text-sm font-bold text-text-700 shadow-sm transition hover:border-text-300 hover:bg-background-100">
                    Browse recipes
                    <LuArrowRight className="h-4 w-4" />
                  </button>
                </article>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
