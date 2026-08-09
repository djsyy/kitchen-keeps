import { useQuery } from '@tanstack/react-query';
import {
  LuBookOpen,
  LuCookingPot,
  LuFolderPlus,
  LuList,
  LuPackageCheck,
} from 'react-icons/lu';
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
          icon: LuCookingPot,
          className:
            'border-secondary-300 from-secondary-100 via-secondary-50 to-secondary-200/80 text-secondary-950 bg-gradient-to-br',
          onClick: () => navigate('/recipes'),
        },
        {
          label: 'Libraries',
          value: String(dashboard.metrics.library_count),
          detail: 'Recipe collections',
          icon: LuBookOpen,
          className:
            'border-accent-300 from-accent-100 via-accent-50 to-accent-200/80 text-accent-950 bg-gradient-to-br',
          onClick: () => navigate('/library'),
        },
        {
          label: 'Pantry',
          value: String(dashboard.metrics.pantry_count),
          detail: 'Ingredients you have',
          icon: LuPackageCheck,
          className:
            'border-primary-300 from-primary-100 via-primary-50 to-primary-200/80 text-primary-950 bg-gradient-to-br',
          onClick: () => navigate('/pantry'),
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
      description: 'Add a recipe to your collection',
      className:
        'border-primary-300 bg-primary-100 text-primary-950 hover:border-primary-400 hover:bg-primary-200',
      onClick: () => navigate('/recipes?create=1'),
    },
    {
      label: 'Create Library',
      icon: LuFolderPlus,
      description: 'Group recipes for later',
      className:
        'border-accent-300 bg-accent-100 text-accent-950 hover:border-accent-400 hover:bg-accent-200',
      onClick: () => navigate('/library?create=1'),
    },
    {
      label: 'Pantry',
      icon: LuPackageCheck,
      description: 'Update what you have',
      className:
        'border-secondary-300 bg-secondary-100 text-secondary-950 hover:border-secondary-400 hover:bg-secondary-200',
      onClick: () => navigate('/pantry'),
    },
    {
      label: 'Ingredients',
      icon: LuList,
      description: 'Manage private ingredients',
      className:
        'border-background-300 bg-background-50 text-text-900 hover:border-background-400 hover:bg-background-100',
      onClick: () => navigate('/ingredients'),
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
