import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import {
  LuFolderPlus,
  LuPlus,
  LuSearch,
  LuEllipsisVertical,
} from 'react-icons/lu';
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
  updateLibrary,
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

type LibraryFormDialogProps = {
  library?: Library;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onSubmit: (payload: CreateLibraryPayload) => void;
};

function LibraryFormDialog({
  library,
  isPending,
  error,
  onCancel,
  onSubmit,
}: LibraryFormDialogProps) {
  const isEditing = Boolean(library);
  const [name, setName] = useState(library?.name ?? '');
  const [description, setDescription] = useState(library?.description ?? '');
  const [iconKey, setIconKey] = useState<LibraryIconKey>(
    library?.icon_key ?? 'folder'
  );
  const [colorKey, setColorKey] = useState<LibraryColorKey>(
    library?.color_key ?? 'primary'
  );

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
        aria-labelledby="library-form-title"
        aria-describedby="library-form-description"
        className="flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-3xl border border-background-300 bg-background-50 p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1
            id="library-form-title"
            className="text-xl font-bold text-text-950"
          >
            {isEditing ? 'Edit library' : 'Create a library'}
          </h1>
          <p
            id="library-form-description"
            className="mt-1 text-sm text-text-600"
          >
            {isEditing
              ? 'Update this collection’s details and appearance.'
              : 'Group recipes by meal type, occasion, or any collection you use.'}
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
                  className={`h-9 rounded-full border px-4 text-sm transition ${libraryColorClasses[option.key]} ${
                    isSelected
                      ? 'border-2 font-bold shadow-sm'
                      : 'font-normal hover:brightness-95'
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
            {isPending
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save changes'
                : 'Create library'}
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
  onEdit,
}: {
  libraries: Library[];
  onCreate: () => void;
  onEdit: (library: Library) => void;
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
            <LibraryCard key={library.id} library={library} onEdit={onEdit} />
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

function LibraryCard({
  library,
  onEdit,
}: {
  library: Library;
  onEdit: (library: Library) => void;
}) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const Icon = libraryIcons[library.icon_key];
  const colorClass = libraryColorClasses[library.color_key];

  useEffect(() => {
    if (!isOptionsOpen) {
      return;
    }

    const closeOptionsOnOutsideClick = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOptionsOnOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', closeOptionsOnOutsideClick);
    };
  }, [isOptionsOpen]);

  return (
    <article
      ref={cardRef}
      className={`relative flex min-h-52 flex-col justify-between rounded-3xl border bg-background-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colorClass.split(' ')[0]}`}
    >
      <div className="flex justify-between">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colorClass}`}
        >
          <Icon className="h-6 w-6" />
        </span>

        <button
          type="button"
          aria-label={`Show options for ${library.name}`}
          aria-expanded={isOptionsOpen}
          aria-haspopup="menu"
          className="rounded-md p-1 text-text-600 transition hover:bg-background-100 hover:text-text-950"
          onClick={() => setIsOptionsOpen((isOpen) => !isOpen)}
        >
          <LuEllipsisVertical className="h-5 w-5" />
        </button>
      </div>

      {isOptionsOpen && (
        <LibraryCardOptions
          onClose={() => setIsOptionsOpen(false)}
          onEdit={() => onEdit(library)}
        />
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-text-950">{library.name}</h2>
        <p className="mt-2 min-h-10 text-sm text-text-600">
          {library.description || 'A collection of recipes.'}
        </p>
      </div>
    </article>
  );
}

function LibraryCardOptions({
  onClose,
  onEdit,
}: {
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      role="menu"
      className="absolute top-14 right-5 z-10 w-32 rounded-lg border border-background-300 bg-background-50 p-1 my-2 shadow-md"
    >
      <button
        type="button"
        role="menuitem"
        className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-text-700 transition hover:bg-background-100"
        onClick={() => {
          onClose();
          onEdit();
        }}
      >
        Edit
      </button>
      <button
        type="button"
        role="menuitem"
        className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-primary transition hover:bg-primary-100"
        onClick={onClose}
      >
        Delete
      </button>
    </div>
  );
}

export default function LibraryList() {
  const queryClient = useQueryClient();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState<Library | null>(null);
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

  const updateLibraryMutation = useMutation({
    mutationFn: ({
      libraryId,
      payload,
    }: {
      libraryId: number;
      payload: CreateLibraryPayload;
    }) => updateLibrary(libraryId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['libraries'] });
      setEditingLibrary(null);
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      {isCreateFormOpen && (
        <LibraryFormDialog
          error={createLibraryMutation.error}
          isPending={createLibraryMutation.isPending}
          onCancel={() => setIsCreateFormOpen(false)}
          onSubmit={(payload) => createLibraryMutation.mutate(payload)}
        />
      )}
      {editingLibrary && (
        <LibraryFormDialog
          key={editingLibrary.id}
          library={editingLibrary}
          error={updateLibraryMutation.error}
          isPending={updateLibraryMutation.isPending}
          onCancel={() => setEditingLibrary(null)}
          onSubmit={(payload) =>
            updateLibraryMutation.mutate({
              libraryId: editingLibrary.id,
              payload,
            })
          }
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
          onEdit={setEditingLibrary}
        />
      )}
    </main>
  );
}
