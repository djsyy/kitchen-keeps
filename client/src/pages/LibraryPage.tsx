import DashboardHeader from '../components/dashboard/DashboardHeader';
import {
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiSearch,
} from 'react-icons/fi';

export default function LibraryPage() {
  const libraryCards = Array.from({ length: 8 }, (_, index) => index + 1);

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
        <section className="rounded-3xl bg-background-50 px-5 py-6 shadow-sm sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
            <label
              htmlFor="library-search"
              className="text-center text-lg font-bold text-text-900 sm:text-xl"
            >
              What are you looking for?
            </label>
            <div className="relative w-full">
              <FiSearch className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-text-500" />
              <input
                id="library-search"
                className="w-full rounded-2xl border border-background-300 bg-white py-3 pr-4 pl-11 text-base text-text-900 shadow-sm outline-none transition placeholder:text-text-400 focus:border-accent focus:ring focus:ring-accent-300"
                type="search"
                placeholder="Search..."
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-full bg-secondary-100 px-4 py-2 text-sm font-bold text-secondary-800">
            View
          </div>
          <button className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-primary-200 bg-background-50 px-4 py-2 text-sm font-bold text-primary shadow-sm transition hover:border-primary-300 hover:bg-primary-50 sm:self-auto">
            <FiFilter className="h-4 w-4" />
            Filter
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {libraryCards.map((cardNumber) => (
            <article
              key={cardNumber}
              className="flex min-h-48 flex-col justify-between rounded-3xl bg-secondary-200 p-5 text-background-50 shadow-sm"
            >
              <div className="h-20 rounded-2xl bg-accent-700/70" />
              <div className="space-y-2">
                <div className="h-4 w-2/3 rounded-full bg-accent-500/70" />
                <div className="h-3 w-1/2 rounded-full bg-accent-400/60" />
              </div>
            </article>
          ))}
        </section>
      </div>

      <footer className="flex items-center justify-center px-4 py-8">
        <div className="flex items-center gap-2 rounded-full bg-background-50 px-3 py-2 shadow-sm">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-600 transition hover:bg-background-200"
            aria-label="Previous page"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-primary px-3 text-sm font-bold text-text-50">
            1
          </span>
          <span className="flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-bold text-text-700">
            2
          </span>
          <span className="px-1 text-text-500">...</span>
          <span className="flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-bold text-text-700">
            4
          </span>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-600 transition hover:bg-background-200"
            aria-label="Next page"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </main>
  );
}
