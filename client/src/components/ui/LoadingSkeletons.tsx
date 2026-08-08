import type { ReactNode } from 'react';
import Navbar from '../layout/Navbar';
import { LoadingRegion, Skeleton } from './Skeleton';

function HeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-full max-w-lg" />
    </div>
  );
}

function ActionSkeleton({ className = 'w-28' }: { className?: string }) {
  return <Skeleton className={`h-10 ${className}`} />;
}

function RecipeCardSkeleton() {
  return (
    <article className="border-background-300 bg-background-50 overflow-hidden rounded-2xl border shadow-sm">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </article>
  );
}

function RecipeRowSkeleton() {
  return (
    <div className="border-background-200 bg-background-50 grid gap-4 rounded-lg border p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <Skeleton className="h-12 w-12" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="flex gap-2 sm:justify-end">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-14" />
      </div>
    </div>
  );
}

function LibraryCardSkeleton() {
  return (
    <article className="border-background-300 bg-background-50 rounded-3xl border p-5 shadow-sm">
      <div className="flex justify-between">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-7 w-7" />
      </div>
      <div className="mt-8 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </article>
  );
}

export function AppLoadingScreen() {
  return (
    <main className="bg-background min-h-screen">
      <LoadingRegion
        label="Loading your account"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <Skeleton className="h-20 w-full" />
        <div className="mt-8 space-y-8">
          <HeaderSkeleton />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </LoadingRegion>
    </main>
  );
}

export function DashboardSkeleton() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <LoadingRegion
        label="Loading your dashboard"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
          <HeaderSkeleton />
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
          <div className="space-y-10">
            <section className="space-y-4">
              <HeaderSkeleton />
              <RecipeRowSkeleton />
              <RecipeRowSkeleton />
              <RecipeRowSkeleton />
            </section>
            <section className="space-y-4">
              <HeaderSkeleton />
              <div className="grid gap-4 md:grid-cols-3">
                <LibraryCardSkeleton />
                <LibraryCardSkeleton />
                <LibraryCardSkeleton />
              </div>
            </section>
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </LoadingRegion>
    </main>
  );
}

export function RecipeListSkeleton() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <LoadingRegion
        label="Loading recipes"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-40" />
          <ActionSkeleton className="w-36" />
        </div>
        <Skeleton className="mb-6 h-12 w-full max-w-md rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RecipeCardSkeleton />
          <RecipeCardSkeleton />
          <RecipeCardSkeleton />
        </div>
      </LoadingRegion>
    </main>
  );
}

export function LibraryListSkeleton() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <LoadingRegion
        label="Loading libraries"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-40" />
          <ActionSkeleton className="w-40" />
        </div>
        <Skeleton className="mb-6 h-12 w-full max-w-md rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LibraryCardSkeleton />
          <LibraryCardSkeleton />
          <LibraryCardSkeleton />
        </div>
      </LoadingRegion>
    </main>
  );
}

export function PantrySkeleton() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <LoadingRegion
        label="Loading pantry"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <HeaderSkeleton />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <section className="border-background-300 bg-background-50 rounded-2xl border p-6 shadow-sm">
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="mt-6 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </section>
          <section className="border-background-300 bg-background-50 rounded-2xl border p-6 shadow-sm">
            <Skeleton className="h-6 w-2/3" />
            <div className="mt-6 space-y-3">
              <RecipeRowSkeleton />
              <RecipeRowSkeleton />
            </div>
          </section>
        </div>
      </LoadingRegion>
    </main>
  );
}

export function IngredientManagementSkeleton() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <LoadingRegion
        label="Loading private ingredients"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <HeaderSkeleton />
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </LoadingRegion>
    </main>
  );
}

function DetailShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <LoadingRegion
        label={label}
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <Skeleton className="h-5 w-28" />
        <div className="mt-6">{children}</div>
      </LoadingRegion>
    </main>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <DetailShell label="Loading recipe">
      <div className="space-y-10">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <RecipeIngredientsSkeleton />
        <RecipeStepsSkeleton />
      </div>
    </DetailShell>
  );
}

export function LibraryDetailSkeleton() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <LoadingRegion
        label="Loading library"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <Skeleton className="h-5 w-28" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)]">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <section className="border-background-300 bg-background-50 rounded-3xl border p-6 shadow-sm">
            <div className="flex justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-64" />
              </div>
              <ActionSkeleton />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
            </div>
          </section>
        </div>
      </LoadingRegion>
    </main>
  );
}

export function CookSessionSkeleton() {
  return (
    <DetailShell label="Loading prep list">
      <div className="space-y-8">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <section className="border-background-300 bg-background-50 rounded-2xl border p-6 shadow-lg">
          <HeaderSkeleton />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </section>
      </div>
    </DetailShell>
  );
}

export function ProfileSkeleton() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <LoadingRegion
        label="Loading account settings"
        className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6"
      >
        <HeaderSkeleton />
        <section className="border-background-200 bg-background-50 rounded-2xl border p-6 shadow-lg sm:p-8 lg:p-10">
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </section>
      </LoadingRegion>
    </main>
  );
}

export function RecipeIngredientsSkeleton() {
  return (
    <section className="border-background-300 bg-background-50 rounded-2xl border p-6 shadow-lg sm:p-8">
      <HeaderSkeleton />
      <div className="mt-8 space-y-4 rounded-xl border border-transparent px-5">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </section>
  );
}

export function IngredientListSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4 px-5 py-5">
      <span className="sr-only">Loading ingredients</span>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function RecipeStepsSkeleton() {
  return (
    <section className="border-background-300 bg-background-50 rounded-2xl border p-6 shadow-lg sm:p-8">
      <HeaderSkeleton />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </section>
  );
}

export function StepListSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4 py-3">
      <span className="sr-only">Loading steps</span>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function RecipePickerSkeleton() {
  return (
    <div
      aria-busy="true"
      className="border-background-200 mt-5 space-y-3 rounded-xl border p-4"
    >
      <span className="sr-only">Loading recipes</span>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function IngredientSearchSkeleton() {
  return (
    <div aria-busy="true" className="space-y-2 px-3 py-2">
      <span className="sr-only">Searching ingredients</span>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-5 w-3/5" />
    </div>
  );
}
