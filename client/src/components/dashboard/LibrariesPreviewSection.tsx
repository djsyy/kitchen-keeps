import { LuArrowRight, LuClock3, LuFolderPlus, LuPlus } from 'react-icons/lu';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import type { LibraryPreview } from './types';

type LibrariesPreviewSectionProps = {
  libraries: LibraryPreview[];
};

function LibraryCard({ library }: { library: LibraryPreview }) {
  const LibraryIcon = library.icon;

  return (
    <article
      className={`rounded-lg border bg-background-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${library.borderClass}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${library.iconClass}`}
        >
          <LibraryIcon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-background-100 px-3 py-1 text-sm font-bold text-text-700">
          {library.recipeCount}
        </span>
      </div>
      <h3 className="text-xl font-bold text-text-950">{library.title}</h3>
      <p className="mt-2 min-h-10 text-sm text-text-600">
        {library.description}
      </p>
      <p className="mt-5 flex items-center gap-2 text-sm font-bold text-text-500">
        <LuClock3 className="h-4 w-4" />
        {library.updatedAt}
      </p>
    </article>
  );
}

function SectionActions() {
  return (
    <div className="flex gap-2">
      <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-200 bg-primary-100 px-3 text-sm font-bold text-primary-900 shadow-sm transition hover:border-primary-300 hover:bg-primary-200">
        <LuPlus className="h-4 w-4" />
        New
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-text-200 bg-background-50 px-3 text-sm font-bold text-text-700 shadow-sm transition hover:border-text-300 hover:bg-background-100">
        View all
        <LuArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function LibrariesPreviewSection({
  libraries,
}: LibrariesPreviewSectionProps) {
  return (
    <section>
      <SectionHeader
        title="Libraries"
        description="Recently updated collections."
        actions={<SectionActions />}
      />

      {libraries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {libraries.map((library) => (
            <LibraryCard key={library.title} library={library} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No libraries yet"
          description="Create a library when you want to group recipes."
          actionLabel="Create Library"
          icon={LuFolderPlus}
        />
      )}
    </section>
  );
}
