import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { LuFolderPlus, LuPlus, LuSearch } from 'react-icons/lu';
import Navbar from '../components/layout/Navbar';
import {
  libraryColorClasses,
  libraryColorOptions,
  libraryIconOptions,
  libraryIcons,
  type LibraryColorKey,
  type LibraryIconKey,
} from '../config/libraryIcons';
import {
  createLibrary,
  getLibraries,
  type CreateLibraryPayload,
  type Library,
} from '../services/libraryService';

function LibraryEmpty({ onCreate }: { onCreate: () => void }) {
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

type LibraryCreateFormProps = {
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onSubmit: (payload: CreateLibraryPayload) => void;
};

function LibraryCreateForm({
  isPending,
  error,
  onCancel,
  onSubmit,
}: LibraryCreateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconKey, setIconKey] = useState<LibraryIconKey>('folder');
  const [colorKey, setColorKey] = useState<LibraryColorKey>('primary');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      icon_key: iconKey,
      color_key: colorKey,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onCancel();
        }
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-library-title"
        aria-describedby="create-library-description"
        className="flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-3xl border border-background-300 bg-background-50 p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1
            id="create-library-title"
            className="text-xl font-bold text-text-950"
          >
            Create a library
          </h1>
          <p
            id="create-library-description"
            className="mt-1 text-sm text-text-600"
          >
            Group recipes by meal type, occasion, or any collection you use.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
          Name
          <input
            className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            maxLength={100}
            required
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <fieldset>
          <legend className="text-sm font-bold text-text-800">Icon</legend>
          <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {libraryIconOptions.map((option) => {
              const Icon = libraryIcons[option.key];
              const isSelected = option.key === iconKey;

              return (
                <button
                  key={option.key}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={isSelected}
                  className={`flex h-10 items-center justify-center rounded-lg border border-background-300 bg-background-50 text-text-700 transition ${
                    isSelected
                      ? 'border-2 border-primary bg-primary-50 text-primary shadow-sm'
                      : 'hover:bg-background-100'
                  }`}
                  onClick={() => setIconKey(option.key)}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-bold text-text-800">
            Card color
          </legend>
          <div className="mt-2 flex gap-2">
            {libraryColorOptions.map((option) => {
              const isSelected = option.key === colorKey;

              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={isSelected}
                  className={`h-9 rounded-full border px-4 text-sm font-normal transition ${libraryColorClasses[option.key]} ${
                    isSelected
                      ? 'font-bold shadow-sm border-2'
                      : 'hover:brightness-95'
                  }`}
                  onClick={() => setColorKey(option.key)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
          Description{' '}
          <span className="font-normal text-text-500">(optional)</span>
          <textarea
            className="min-h-24 rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </label>
        {error && (
          <p className="text-sm font-bold text-red-700">{error.message}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg px-4 py-2.5 text-sm font-bold text-text-700 transition hover:bg-background-100"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !name.trim()}
          >
            {isPending ? 'Creating...' : 'Create library'}
          </button>
        </div>
      </form>
    </div>
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

function LibraryGrid({
  libraries,
  onCreate,
}: {
  libraries: Library[];
  onCreate: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visibleLibraries = libraries.filter((library) =>
    [library.name, library.description]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedSearchTerm))
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-950">Your libraries</h1>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
          onClick={onCreate}
        >
          <LuPlus className="h-4 w-4" />
          Create a library
        </button>
      </div>
      <div className="relative mb-6 max-w-md">
        <label className="sr-only" htmlFor="library-search">
          Search libraries
        </label>
        <LuSearch className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-text-500" />
        <input
          id="library-search"
          type="search"
          placeholder="Search libraries..."
          className="w-full rounded-2xl border border-background-300 bg-background-50 py-3 pr-4 pl-11 text-base text-text-900 shadow-sm outline-none transition placeholder:text-text-400 focus:border-primary focus:ring focus:ring-primary-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
        />
      </div>
      {visibleLibraries.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLibraries.map((library) => (
            <LibraryCard key={library.id} library={library} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-background-300 bg-background-50 px-5 py-8 text-center text-sm text-text-600">
          No libraries match “{searchTerm}”.
        </p>
      )}
    </section>
  );
}

function LibraryCard({ library }: { library: Library }) {
  const Icon = libraryIcons[library.icon_key];
  const colorClass = libraryColorClasses[library.color_key];

  return (
    <article
      className={`flex min-h-52 flex-col justify-between rounded-3xl border bg-background-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colorClass.split(' ')[0]}`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colorClass}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="mt-8">
        <h2 className="text-xl font-bold text-text-950">{library.name}</h2>
        <p className="mt-2 min-h-10 text-sm text-text-600">
          {library.description || 'A collection of recipes.'}
        </p>
      </div>
    </article>
  );
}

export default function LibraryList() {
  const queryClient = useQueryClient();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { data, isError, isPending } = useQuery({
    queryKey: ['libraries'],
    queryFn: getLibraries,
  });

  const libraries = data?.data.libraries ?? [];

  const createLibraryMutation = useMutation({
    mutationFn: createLibrary,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['libraries'] });
      setIsCreateFormOpen(false);
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      {isCreateFormOpen && (
        <LibraryCreateForm
          error={createLibraryMutation.error}
          isPending={createLibraryMutation.isPending}
          onCancel={() => setIsCreateFormOpen(false)}
          onSubmit={(payload) => createLibraryMutation.mutate(payload)}
        />
      )}
      {isPending ? (
        <LibraryLoading />
      ) : isError ? (
        <LibraryError />
      ) : libraries.length === 0 ? (
        <LibraryEmpty onCreate={() => setIsCreateFormOpen(true)} />
      ) : (
        <LibraryGrid
          libraries={libraries}
          onCreate={() => setIsCreateFormOpen(true)}
        />
      )}
    </main>
  );
}
