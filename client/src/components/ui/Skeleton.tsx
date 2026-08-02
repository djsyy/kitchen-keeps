import type { ReactNode } from 'react';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`bg-background-200 block animate-pulse rounded motion-reduce:animate-none ${className}`}
    />
  );
}

type LoadingRegionProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function LoadingRegion({
  label,
  children,
  className = '',
}: LoadingRegionProps) {
  return (
    <section aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </section>
  );
}
