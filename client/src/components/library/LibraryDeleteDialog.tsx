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
      className="bg-text-950/50 fixed inset-0 z-50 flex items-center justify-center p-4"
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
        className="bg-background-50 w-full max-w-md rounded-2xl p-6 shadow-xl"
      >
        <div className="space-y-3">
          <h1
            id="delete-library-title"
            className="text-text-950 text-xl font-bold"
          >
            Delete {library.name}?
          </h1>
          <p id="delete-library-description" className="text-text-700 text-sm">
            This permanently deletes the library. Its recipes are not deleted.
          </p>
          {error && <ErrorMessage message={error.message} />}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="border-background-300 text-text-700 hover:bg-background-100 rounded-md border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-primary-700 text-text-50 hover:bg-primary-600 rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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
