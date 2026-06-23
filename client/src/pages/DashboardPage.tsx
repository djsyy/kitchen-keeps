import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardHero from '../components/dashboard/DashboardHero';
import LibrariesPreviewSection from '../components/dashboard/LibrariesPreviewSection';
import PrepListPanel from '../components/dashboard/PrepListPanel';
import QuickActions from '../components/dashboard/QuickActions';
import RecipesPreviewSection from '../components/dashboard/RecipesPreviewSection';
import {
  activeCookList,
  dashboardMetrics,
  libraryPreviews,
  quickActions,
  recipePreviews,
} from '../components/dashboard/dashboardData';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <DashboardHero metrics={dashboardMetrics} />
        <QuickActions actions={quickActions} />

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
          <div className="space-y-10">
            <RecipesPreviewSection recipes={recipePreviews} />
            <LibrariesPreviewSection libraries={libraryPreviews} />
          </div>

          <PrepListPanel activeCookList={activeCookList} />
        </div>
      </div>
    </main>
  );
}
