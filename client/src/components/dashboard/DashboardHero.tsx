import { LuUtensils } from 'react-icons/lu';
import type { DashboardMetric } from './types';

type DashboardHeroProps = {
  metrics: DashboardMetric[];
};

function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article
      className={`rounded-lg border-2 p-4 shadow-md ${metric.className}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-md font-bold">{metric.label}</p>
        <p className="text-2xl font-bold">{metric.value}</p>
      </div>
      <p className="text-md mt-1">{metric.detail}</p>
    </article>
  );
}

export default function DashboardHero({ metrics }: DashboardHeroProps) {
  return (
    <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] xl:items-end">
      <div>
        <p className="bg-secondary-300 text-secondary-800 mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold">
          <LuUtensils className="h-4 w-4" />
          Dashboard
        </p>
        <h1 className="text-text-950 mb-3 max-w-3xl text-3xl font-bold">
          Find Your Next Meal
        </h1>
        <p className="text-text-600 max-w-2xl text-base">
          Organize recipes and plan ahead.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}
