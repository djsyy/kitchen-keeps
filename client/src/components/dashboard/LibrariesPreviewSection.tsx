import { LuArrowRight, LuClock3, LuFolderPlus, LuPlus } from 'react-icons/lu';
import LibraryImagePlaceholder from '../library/LibraryImagePlaceholder';
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
  return (
    <button
      type="button"
      className="border-background-300 bg-background-50 focus-visible:outline-primary relative w-full overflow-hidden rounded-lg border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
      onClick={() => onOpen(library.id)}
    >
      {library.coverImageUrl ? (
        <img
          src={library.coverImageUrl}
          alt=""
          className="h-24 w-full object-cover"
        />
      ) : (
        <LibraryImagePlaceholder
          className="h-24 w-full"
          iconClassName="h-7 w-7"
        />
      )}
      <span className="bg-background-50/95 text-text-700 absolute top-3 left-3 rounded-full px-2.5 py-1 text-sm font-bold shadow-sm">
        {library.recipeCount}
      </span>
      <div className="p-4">
        <h3 className="text-text-950 text-lg font-bold">{library.title}</h3>
        <p className="text-text-600 mt-1 line-clamp-2 text-sm leading-5">
          {library.description || 'No description yet.'}
        </p>
        <p className="text-text-500 mt-3 flex items-center gap-2 text-sm font-bold">
          <LuClock3 className="h-4 w-4" />
          {library.updatedLabel}
        </p>
      </div>
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
        className="border-golden-orange-300 bg-golden-orange-100 text-golden-orange-900 hover:border-golden-orange-300 hover:bg-golden-orange-200 inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold shadow-sm transition"
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
