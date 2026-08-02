import { LuArrowRight, LuClock3, LuFolderPlus, LuPlus } from 'react-icons/lu';
import { libraryColorClasses, libraryIcons } from '../../config/libraryIcons';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import type { LibraryPreview } from './types';

type LibrariesPreviewSectionProps = {
  libraries: LibraryPreview[];
  onCreate: () => void;
  onViewAll: () => void;
  onOpen: (libraryId: number) => void;
};

function LibraryCard({
  library,
  onOpen,
}: {
  library: LibraryPreview;
  onOpen: (libraryId: number) => void;
}) {
  const LibraryIcon = libraryIcons[library.iconKey];
  const colorClass = libraryColorClasses[library.colorKey];

  return (
    <button
      type="button"
      className={`bg-background-50 w-full rounded-lg border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colorClass.split(' ')[0]}`}
      onClick={() => onOpen(library.id)}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
        >
          <LibraryIcon className="h-5 w-5" />
        </span>
        <span className="bg-background-100 text-text-700 rounded-full px-3 py-1 text-sm font-bold">
          {library.recipeCount}
        </span>
      </div>
      <h3 className="text-text-950 text-xl font-bold">{library.title}</h3>
      <p className="text-text-600 mt-2 min-h-10 text-sm">
        {library.description || 'No description yet.'}
      </p>
      <p className="text-text-500 mt-5 flex items-center gap-2 text-sm font-bold">
        <LuClock3 className="h-4 w-4" />
        {library.updatedLabel}
      </p>
    </button>
  );
}

function SectionActions({
  onCreate,
  onViewAll,
}: Pick<LibrariesPreviewSectionProps, 'onCreate' | 'onViewAll'>) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="border-primary-200 bg-primary-100 text-primary-900 hover:border-primary-300 hover:bg-primary-200 inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold shadow-sm transition"
        onClick={onCreate}
      >
        <LuPlus className="h-4 w-4" />
        New
      </button>
      <button
        type="button"
        className="border-text-200 bg-background-50 text-text-700 hover:border-text-300 hover:bg-background-100 inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold shadow-sm transition"
        onClick={onViewAll}
      >
        View all
        <LuArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function LibrariesPreviewSection({
  libraries,
  onCreate,
  onViewAll,
  onOpen,
}: LibrariesPreviewSectionProps) {
  return (
    <section>
      <SectionHeader
        title="Libraries"
        description="Recently updated collections."
        actions={<SectionActions onCreate={onCreate} onViewAll={onViewAll} />}
      />

      {libraries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {libraries.map((library) => (
            <LibraryCard key={library.id} library={library} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No libraries yet"
          description="Create a library when you want to group recipes."
          actionLabel="Create Library"
          icon={LuFolderPlus}
          onAction={onCreate}
        />
      )}
    </section>
  );
}
