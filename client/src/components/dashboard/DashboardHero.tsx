import { LuUtensils } from 'react-icons/lu';
import type { DashboardMetric } from './types';

type DashboardHeroProps = {
  metrics: DashboardMetric[];
};

function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  const MetricIcon = metric.icon;

  return (
    <button
      type="button"
      className={`focus-visible:outline-primary group relative overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 ${metric.className}`}
      onClick={metric.onClick}
    >
      <span className="bg-background-50/60 absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl transition group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="bg-background-50/80 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm">
          <MetricIcon aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="text-3xl font-bold tracking-tight">
          {metric.value}
        </span>
      </div>
      <div className="relative mt-5">
        <p className="font-bold">{metric.label}</p>
        <p className="mt-1 text-sm opacity-80">{metric.detail}</p>
      </div>
    </button>
  );
}

export default function DashboardHero({ metrics }: DashboardHeroProps) {
  return (
    <section className="mb-8">
      <div className="max-w-3xl">
        <p className="border-brick-red-400 bg-brick-red-200 text-brick-red-900 mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold">
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

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}
