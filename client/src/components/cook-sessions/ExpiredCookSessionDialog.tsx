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
    <div className="bg-text-950/50 fixed inset-0 z-50 flex items-center justify-center p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="expired-cook-session-title"
        aria-describedby="expired-cook-session-description"
        className="bg-background-50 w-full max-w-md rounded-2xl p-6 shadow-xl"
      >
        <p className="text-primary-700 text-sm font-bold tracking-wide uppercase">
          Prep list expired
        </p>
        <h1
          id="expired-cook-session-title"
          className="text-text-950 mt-1 text-2xl font-bold"
        >
          Start a fresh prep list?
        </h1>
        <p
          id="expired-cook-session-description"
          className="text-text-700 mt-3 text-sm leading-6"
        >
          Your {recipeTitle} prep list was inactive for more than seven days, so
          it has expired. A new list will use the recipe&apos;s current
          ingredients.
        </p>
        {error && <ErrorMessage className="mt-4" message={error.message} />}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="border-background-300 bg-background-50 text-text-700 hover:bg-background-100 rounded-lg border px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onBack}
          >
            Back to recipe
          </button>
          <button
            type="button"
            className="bg-primary text-text-50 hover:bg-primary-700 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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
