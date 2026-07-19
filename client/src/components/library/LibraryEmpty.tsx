import { LuFolderPlus, LuPlus } from 'react-icons/lu';

export default function LibraryEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
      <article className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-dashed border-background-300 bg-background-50 px-6 py-12 text-center shadow-sm sm:px-10">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-800">
          <LuFolderPlus className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold text-text-950">No libraries yet</h1>
        <p className="mt-3 max-w-md text-base text-text-600">
          Create a library to group recipes by meal type, occasion, or anything
          else that helps you find them later.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
          onClick={onCreate}
        >
          <LuPlus className="h-4 w-4" />
          Create a library
        </button>
      </article>
    </section>
  );
}
