import ErrorMessage from '../ui/ErrorMessage';

type ExpiredCookSessionDialogProps = {
  recipeTitle: string;
  isPending: boolean;
  error: Error | null;
  onCreateNew: () => void;
  onBack: () => void;
};

export default function ExpiredCookSessionDialog({
  recipeTitle,
  isPending,
  error,
  onCreateNew,
  onBack,
}: ExpiredCookSessionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-950/50 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="expired-cook-session-title"
        aria-describedby="expired-cook-session-description"
        className="w-full max-w-md rounded-2xl bg-background-50 p-6 shadow-xl"
      >
        <p className="text-sm font-bold uppercase tracking-wide text-primary-700">
          Prep list expired
        </p>
        <h1
          id="expired-cook-session-title"
          className="mt-1 text-2xl font-bold text-text-950"
        >
          Start a fresh prep list?
        </h1>
        <p
          id="expired-cook-session-description"
          className="mt-3 text-sm leading-6 text-text-700"
        >
          Your {recipeTitle} prep list was inactive for more than seven days, so
          it has expired. A new list will use the recipe&apos;s current
          ingredients.
        </p>
        {error && <ErrorMessage className="mt-4" message={error.message} />}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onBack}
          >
            Back to recipe
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onCreateNew}
            autoFocus
          >
            {isPending ? 'Creating...' : 'Create new prep list'}
          </button>
        </div>
      </section>
    </div>
  );
}
