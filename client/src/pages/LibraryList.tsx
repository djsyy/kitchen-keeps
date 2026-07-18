import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import { LuFolderPlus, LuPlus } from 'react-icons/lu';
import { getLibraries, type Library } from '../services/libraryService';

function LibraryEmpty() {
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
        >
          <LuPlus className="h-4 w-4" />
          Create a library
        </button>
      </article>
    </section>
  );
}

function LibraryLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="text-text-600">Loading libraries…</p>
    </section>
  );
}

function LibraryError() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="text-text-600">
        We couldn’t load your libraries. Please try again.
      </p>
    </section>
  );
}

function LibraryGrid({ libraries }: { libraries: Library[] }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
      {libraries.map((library) => (
        <article
          key={library.id}
          className="rounded-3xl border border-background-300 bg-background-50 p-5 shadow-sm"
        >
          <h1 className="text-xl font-bold text-text-950">{library.name}</h1>
          {library.description && (
            <p className="mt-2 text-sm text-text-600">{library.description}</p>
          )}
        </article>
      ))}
    </section>
  );
}

export default function LibraryList() {
  const { data, isError, isPending } = useQuery({
    queryKey: ['libraries'],
    queryFn: getLibraries,
  });

  const libraries = data?.data.libraries ?? [];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      {isPending ? (
        <LibraryLoading />
      ) : isError ? (
        <LibraryError />
      ) : libraries.length === 0 ? (
        <LibraryEmpty />
      ) : (
        <LibraryGrid libraries={libraries} />
      )}
    </main>
  );
}
