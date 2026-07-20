import type { Library } from '../../services/libraryService';
import ErrorMessage from '../ui/ErrorMessage';

type LibraryDeleteDialogProps = {
  library: Library;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LibraryDeleteDialog({
  library,
  isPending,
  error,
  onCancel,
  onConfirm,
}: LibraryDeleteDialogProps) {
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
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-library-title"
        aria-describedby="delete-library-description"
        className="w-full max-w-md rounded-2xl bg-background-50 p-6 shadow-xl"
      >
        <div className="space-y-3">
          <h1
            id="delete-library-title"
            className="text-xl font-bold text-text-950"
          >
            Delete {library.name}?
          </h1>
          <p id="delete-library-description" className="text-sm text-text-700">
            This permanently deletes the library. Its recipes are not deleted.
          </p>
          {error && <ErrorMessage message={error.message} />}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border border-background-300 px-4 py-2 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-primary-700 px-4 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? 'Deleting...' : 'Delete library'}
          </button>
        </div>
      </section>
    </div>
  );
}
