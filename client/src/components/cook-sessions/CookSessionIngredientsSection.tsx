import { LuCheck, LuX } from 'react-icons/lu';
import type {
  CookSessionItem,
  CookSessionItemStatus,
} from '../../services/cookSessionService';
import { formatIngredientQuantity } from '../../utils/recipeDisplay';
import ErrorMessage from '../ui/ErrorMessage';

const itemStatusOptions: {
  label: string;
  status: CookSessionItemStatus;
  className: string;
  selectedClassName: string;
}[] = [
  {
    label: 'Not sure',
    status: 'unknown',
    className: 'border-background-300 bg-background-50 text-text-700',
    selectedClassName: 'border-background-500 bg-background-200 text-text-900',
  },
  {
    label: 'Have it',
    status: 'have',
    className: 'border-olive-green-300 bg-olive-green-100 text-olive-green-900',
    selectedClassName:
      'border-olive-green-500 bg-olive-green-300 text-olive-green-950',
  },
  {
    label: 'Need it',
    status: 'need',
    className: 'border-brick-red-300 bg-brick-red-50 text-brick-red-900',
    selectedClassName:
      'border-brick-red-400 bg-brick-red-200 text-brick-red-950',
  },
];

type CookSessionIngredientsSectionProps = {
  items: CookSessionItem[];
  isUpdatingItem: boolean;
  isCompleting: boolean;
  isCancelling: boolean;
  updateError: Error | null;
  completeError: Error | null;
  cancelError: Error | null;
  onUpdateItem: (
    cookSessionItemId: number,
    status: CookSessionItemStatus
  ) => void;
  onComplete: () => void;
  onCancel: () => void;
};

export default function CookSessionIngredientsSection({
  items,
  isUpdatingItem,
  isCompleting,
  isCancelling,
  updateError,
  completeError,
  cancelError,
  onUpdateItem,
  onComplete,
  onCancel,
}: CookSessionIngredientsSectionProps) {
  const isClosing = isCompleting || isCancelling;
  const areActionsPending = isClosing || isUpdatingItem;
  const uncheckedCount = items.filter((item) => item.status === null).length;
  const hasUncheckedItems = uncheckedCount > 0;

  return (
    <section className="border-background-300 bg-background-50 rounded-2xl border p-6 shadow-lg sm:p-8">
      <h2 className="text-text-950 text-2xl font-bold">Ingredients</h2>
      {items.length === 0 ? (
        <p className="text-text-600 mt-5 text-sm">
          This recipe did not have any ingredients when this prep list started.
        </p>
      ) : (
        <ul className="divide-background-200 border-background-200 bg-background-100/70 mt-5 divide-y rounded-xl border px-5">
          {items.map((item) => {
            const quantity = formatIngredientQuantity(item);

            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 py-4 first:pt-5 last:pb-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-text-800 wrap-break-words font-bold">
                    {item.display_name}
                  </p>
                  {quantity && (
                    <p className="text-text-600 mt-1 text-sm">{quantity}</p>
                  )}
                </div>
                <div
                  className="flex flex-wrap gap-2"
                  aria-label={`Availability for ${item.display_name}`}
                >
                  {itemStatusOptions.map((option) => {
                    const isSelected = item.status === option.status;

                    return (
                      <button
                        key={option.status}
                        type="button"
                        aria-pressed={isSelected}
                        className={`rounded-lg border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${option.className} ${
                          isSelected ? option.selectedClassName : ''
                        }`}
                        disabled={isClosing || isUpdatingItem}
                        onClick={() => onUpdateItem(item.id, option.status)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {updateError && (
        <ErrorMessage className="mt-4" message={updateError.message} />
      )}
      <div className="border-background-200 mt-6 border-t pt-6">
        {(completeError || cancelError) && (
          <ErrorMessage
            className="mb-4"
            message={
              completeError?.message ??
              cancelError?.message ??
              'Unable to update this prep list.'
            }
          />
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="bg-primary text-text-50 hover:bg-primary-700 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={areActionsPending || hasUncheckedItems}
            onClick={onComplete}
          >
            <LuCheck className="h-4 w-4" />
            {isCompleting ? 'Finishing...' : 'Finish & view summary'}
          </button>
          <button
            type="button"
            className="border-background-300 bg-background-50 text-text-700 hover:bg-background-100 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={areActionsPending}
            onClick={onCancel}
          >
            <LuX className="h-4 w-4" />
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        </div>
        {hasUncheckedItems && (
          <p className="text-text-600 mt-3 text-sm">
            Mark all {uncheckedCount} remaining{' '}
            {uncheckedCount === 1 ? 'ingredient' : 'ingredients'} before
            finishing.
          </p>
        )}
      </div>
    </section>
  );
}
