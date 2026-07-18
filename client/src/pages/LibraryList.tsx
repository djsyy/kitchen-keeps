import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { LuFolderPlus, LuPlus } from 'react-icons/lu';
import Navbar from '../components/layout/Navbar';
import {
  createLibrary,
  getLibraries,
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
  onSubmit: (payload: { name: string; description: string | null }) => void;
};

function LibraryCreateForm({
  isPending,
  error,
  onCancel,
  onSubmit,
}: LibraryCreateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ name: name.trim(), description: description.trim() || null });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <form
        className="mx-auto flex max-w-2xl flex-col gap-4 rounded-3xl border border-background-300 bg-background-50 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <h1 className="text-xl font-bold text-text-950">Create a library</h1>
          <p className="mt-1 text-sm text-text-600">
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

function LibraryGrid({
  libraries,
  onCreate,
}: {
  libraries: Library[];
  onCreate: () => void;
}) {
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {libraries.map((library) => (
          <article
            key={library.id}
            className="rounded-3xl border border-background-300 bg-background-50 p-5 shadow-sm"
          >
            <h2 className="text-xl font-bold text-text-950">{library.name}</h2>
            {library.description && (
              <p className="mt-2 text-sm text-text-600">
                {library.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
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
