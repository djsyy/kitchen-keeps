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
      <p className="mt-1 text-md">{metric.detail}</p>
    </article>
  );
}

export default function DashboardHero({ metrics }: DashboardHeroProps) {
  return (
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
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}
