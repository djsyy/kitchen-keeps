import { LuBookOpen, LuPlus, LuSearch } from 'react-icons/lu';
import Navbar from '../components/layout/Navbar';

export default function RecipeListPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-950">Your recipes</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
          >
            <LuPlus className="h-4 w-4" />
            Create a recipe
          </button>
        </div>

        <div className="relative max-w-md">
          <label className="sr-only" htmlFor="recipe-search">
            Search recipes
          </label>
          <LuSearch className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-text-500" />
          <input
            id="recipe-search"
            type="search"
            placeholder="Search recipes..."
            className="w-full rounded-2xl border border-background-300 bg-background-50 py-3 pr-4 pl-11 text-base text-text-900 shadow-sm outline-none transition placeholder:text-text-400 focus:border-primary focus:ring focus:ring-primary-100"
          />
        </div>

        <article className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-background-300 bg-background-50 px-6 py-12 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-800">
            <LuBookOpen className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-text-950">
            No recipes yet
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-text-600">
            Recipes you create will appear here. You’ll be able to search them
            and add them to libraries.
          </p>
        </article>
      </section>
    </main>
  );
}
