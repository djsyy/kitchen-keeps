import { type MouseEvent, useState } from 'react';
import { LuEllipsisVertical, LuPlus, LuSearch } from 'react-icons/lu';
import { libraryColorClasses, libraryIcons } from '../../config/libraryIcons';
import useCardOptionsMenu from '../../hooks/useCardOptionsMenu';
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
        <h1 className="text-text-950 text-2xl font-bold">Your libraries</h1>
        <button
          type="button"
          className="bg-primary text-text-50 hover:bg-primary-700 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition"
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
        <LuSearch className="text-text-500 pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        <input
          id="library-search"
          type="search"
          placeholder="Search libraries..."
          className="border-background-300 bg-background-50 text-text-900 placeholder:text-text-400 focus:border-primary focus:ring-primary-100 w-full rounded-2xl border py-3 pr-4 pl-11 text-base shadow-sm transition outline-none focus:ring"
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
        <p className="border-background-300 bg-background-50 text-text-600 rounded-2xl border border-dashed px-5 py-8 text-center text-sm">
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
  const { containerRef, isOptionsOpen, setIsOptionsOpen, toggleOptions } =
    useCardOptionsMenu<HTMLElement>();
  const Icon = libraryIcons[library.icon_key];
  const colorClass = libraryColorClasses[library.color_key];

  return (
    <article
      ref={containerRef}
      className={`bg-background-50 hover:bg-background-100 relative cursor-pointer overflow-hidden rounded-3xl border shadow-sm transition hover:shadow-md ${
        library.cover_image_url
          ? 'border-background-300'
          : colorClass.split(' ')[0]
      }`}
      onClick={() => onOpen(library)}
    >
      {library.cover_image_url && (
        <img
          src={library.cover_image_url}
          alt=""
          className="h-44 w-full object-cover"
        />
      )}
      <div
        className={
          library.cover_image_url ? 'absolute top-4 right-4' : 'p-5 pb-0'
        }
      >
        {!library.cover_image_url && (
          <div className="flex justify-between">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colorClass}`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <LibraryOptionsButton
              libraryName={library.name}
              isOptionsOpen={isOptionsOpen}
              hasCover={false}
              onClick={(event) => {
                event.stopPropagation();
                toggleOptions();
              }}
            />
          </div>
        )}
        {library.cover_image_url && (
          <LibraryOptionsButton
            libraryName={library.name}
            isOptionsOpen={isOptionsOpen}
            hasCover
            onClick={(event) => {
              event.stopPropagation();
              toggleOptions();
            }}
          />
        )}
      </div>
      {isOptionsOpen && (
        <LibraryCardOptions
          onClick={(event) => event.stopPropagation()}
          onClose={() => setIsOptionsOpen(false)}
          onEdit={() => onEdit(library)}
          onDelete={() => onDelete(library)}
        />
      )}
      <div className={library.cover_image_url ? 'p-5' : 'p-5 pt-8'}>
        <h2 className="text-text-950 text-xl font-bold">{library.name}</h2>
        {library.description && (
          <p className="text-text-600 mt-2 line-clamp-2 text-sm leading-5">
            {library.description}
          </p>
        )}
      </div>
    </article>
  );
}

function LibraryOptionsButton({
  libraryName,
  isOptionsOpen,
  hasCover,
  onClick,
}: {
  libraryName: string;
  isOptionsOpen: boolean;
  hasCover: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Show options for ${libraryName}`}
      aria-expanded={isOptionsOpen}
      aria-haspopup="menu"
      className={`text-text-600 hover:bg-background-100 hover:text-text-950 focus-visible:outline-primary rounded-md p-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
        hasCover ? 'bg-background-50/90 shadow-sm' : ''
      }`}
      onClick={onClick}
    >
      <LuEllipsisVertical className="h-5 w-5" />
    </button>
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
      className="border-background-300 bg-background-50 absolute top-14 right-5 z-10 my-2 w-32 rounded-lg border p-1 shadow-md"
      onClick={onClick}
    >
      <button
        type="button"
        role="menuitem"
        className="text-text-700 hover:bg-background-100 w-full rounded-md px-3 py-2 text-left text-sm font-bold transition"
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
        className="text-primary hover:bg-primary-100 w-full rounded-md px-3 py-2 text-left text-sm font-bold transition"
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
