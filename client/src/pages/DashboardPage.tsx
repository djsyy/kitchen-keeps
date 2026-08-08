import { useQuery } from '@tanstack/react-query';
import { LuBookOpen, LuFolderPlus, LuSearch } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import DashboardHero from '../components/dashboard/DashboardHero';
import LibrariesPreviewSection from '../components/dashboard/LibrariesPreviewSection';
import PrepListPanel from '../components/dashboard/PrepListPanel';
import QuickActions from '../components/dashboard/QuickActions';
import RecipesPreviewSection from '../components/dashboard/RecipesPreviewSection';
import { DashboardSkeleton } from '../components/ui/LoadingSkeletons';
import type {
  DashboardMetric,
  LibraryPreview,
  QuickAction,
  RecipePreview,
} from '../components/dashboard/types';
import { getDashboard } from '../services/dashboardService';
import { queryKeys } from '../utils/queryKeys';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) {
    return 'Updated recently';
  }

  const differenceInSeconds = Math.round((timestamp - Date.now()) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(differenceInSeconds) >= seconds) {
      return `Updated ${relativeTimeFormatter.format(
        Math.round(differenceInSeconds / seconds),
        unit
      )}`;
    }
  }

  return 'Updated just now';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isError, isPending } = useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: getDashboard,
  });

  if (isPending) {
    return <DashboardSkeleton />;
  }

  const dashboard = data?.data;
  const metrics: DashboardMetric[] = dashboard
    ? [
        {
          label: 'Recipes',
          value: String(dashboard.metrics.recipe_count),
          detail: 'Recipes you created',
          className: 'border-secondary-300 bg-secondary-200 text-secondary-900',
        },
        {
          label: 'Libraries',
          value: String(dashboard.metrics.library_count),
          detail: 'Recipe collections',
          className: 'border-2 border-accent-200 bg-accent-50 text-accent-900',
        },
        {
          label: 'Ingredients',
          value: String(dashboard.metrics.ingredient_count),
          detail: 'Across your recipes',
          className: 'border-primary-300 bg-primary-200 text-primary-900',
        },
      ]
    : [];
  const recipes: RecipePreview[] =
    dashboard?.recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      imageUrl: recipe.image_url,
      libraryNames: recipe.library_names,
      updatedLabel: formatUpdatedAt(recipe.updated_at),
      ingredientCount: recipe.ingredient_count,
    })) ?? [];
  const libraries: LibraryPreview[] =
    dashboard?.libraries.map((library) => ({
      id: library.id,
      title: library.name,
      description: library.description,
      recipeCount: library.recipe_count,
      updatedLabel: formatUpdatedAt(library.updated_at),
      iconKey: library.icon_key,
      colorKey: library.color_key,
      coverImageUrl: library.cover_image_url,
    })) ?? [];
  const activeCookList = dashboard?.activeCookSession
    ? {
        id: dashboard.activeCookSession.id,
        recipeId: dashboard.activeCookSession.recipe_id,
        recipeTitle: dashboard.activeCookSession.recipe_title,
        checkedCount: dashboard.activeCookSession.checked_count,
        totalCount: dashboard.activeCookSession.item_count,
        remainingCount: dashboard.activeCookSession.unchecked_count,
      }
    : null;
  const quickActions: QuickAction[] = [
    {
      label: 'New Recipe',
      icon: LuBookOpen,
      className: 'bg-primary text-text-100 hover:bg-primary-700',
      onClick: () => navigate('/recipes?create=1'),
    },
    {
      label: 'Create Library',
      icon: LuFolderPlus,
      className:
        'border border-accent-300 bg-accent-50 text-accent-900 hover:bg-accent-100',
      onClick: () => navigate('/library?create=1'),
    },
    {
      label: 'Browse Recipes',
      icon: LuSearch,
      className:
        'border border-secondary-300 bg-secondary-50 text-secondary-900 hover:bg-secondary-100',
      onClick: () => navigate('/recipes'),
    },
  ];

  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {isError || !dashboard ? (
          <p className="text-text-600">
            We couldn&apos;t load your dashboard. Please try again.
          </p>
        ) : (
          <>
            <DashboardHero metrics={metrics} />
            <QuickActions actions={quickActions} />

            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
              <div className="space-y-10">
                <RecipesPreviewSection
                  recipes={recipes}
                  onCreate={() => navigate('/recipes?create=1')}
                  onViewAll={() => navigate('/recipes')}
                  onOpen={(recipeId) => navigate(`/recipes/${recipeId}`)}
                />
                <LibrariesPreviewSection
                  libraries={libraries}
                  onCreate={() => navigate('/library?create=1')}
                  onViewAll={() => navigate('/library')}
                  onOpen={(libraryId) => navigate(`/library/${libraryId}`)}
                />
              </div>

              <PrepListPanel
                activeCookList={activeCookList}
                onContinue={(cookSessionId) =>
                  navigate(`/cook-sessions/${cookSessionId}`)
                }
                onBrowseRecipes={() => navigate('/recipes')}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
