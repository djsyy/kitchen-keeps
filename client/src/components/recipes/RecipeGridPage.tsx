import { LuPlus, LuSearch } from 'react-icons/lu';

export default function RecipeGrid({ onCreate }: { onCreate: () => void }) {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-950">Your recipes</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
            onClick={onCreate}
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
      </section>
    </>
  );
}
