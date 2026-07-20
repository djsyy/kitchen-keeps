import { type MouseEvent, useEffect, useRef, useState } from 'react';
import { LuEllipsisVertical, LuPlus, LuSearch } from 'react-icons/lu';
import { libraryColorClasses, libraryIcons } from '../../config/libraryIcons';
import type { Library } from '../../services/libraryService';

type LibraryGridProps = {
  libraries: Library[];
  onCreate: () => void;
  onOpen: (library: Library) => void;
  onEdit: (library: Library) => void;
  onDelete: (library: Library) => void;
};

export default function LibraryGrid({
  libraries,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
}: LibraryGridProps) {
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
            <LibraryCard
              key={library.id}
              library={library}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
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
  onOpen,
  onEdit,
  onDelete,
}: {
  library: Library;
  onOpen: (library: Library) => void;
  onEdit: (library: Library) => void;
  onDelete: (library: Library) => void;
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
      className={`relative flex min-h-52 cursor-pointer flex-col justify-between rounded-3xl border bg-background-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colorClass.split(' ')[0]}`}
      onClick={() => onOpen(library)}
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
          onClick={(event) => {
            event.stopPropagation();
            setIsOptionsOpen((isOpen) => !isOpen);
          }}
        >
          <LuEllipsisVertical className="h-5 w-5" />
        </button>
      </div>
      {isOptionsOpen && (
        <LibraryCardOptions
          onClick={(event) => event.stopPropagation()}
          onClose={() => setIsOptionsOpen(false)}
          onEdit={() => onEdit(library)}
          onDelete={() => onDelete(library)}
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
  onClick,
  onClose,
  onEdit,
  onDelete,
}: {
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="menu"
      className="absolute top-14 right-5 z-10 my-2 w-32 rounded-lg border border-background-300 bg-background-50 p-1 shadow-md"
      onClick={onClick}
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
        onClick={() => {
          onClose();
          onDelete();
        }}
      >
        Delete
      </button>
    </div>
  );
}
