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
    className: 'border-secondary-300 bg-secondary-100 text-secondary-900',
    selectedClassName:
      'border-secondary-500 bg-secondary-300 text-secondary-950',
  },
  {
    label: 'Need it',
    status: 'need',
    className: 'border-primary-300 bg-primary-50 text-primary-900',
    selectedClassName: 'border-primary-500 bg-primary-200 text-primary-950',
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

  return (
    <section className="rounded-2xl border border-background-300 bg-background-50 p-6 shadow-lg sm:p-8">
      <h2 className="text-2xl font-bold text-text-950">Ingredients</h2>
      {items.length === 0 ? (
        <p className="mt-5 text-sm text-text-600">
          This recipe did not have any ingredients when this prep list started.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-background-200 rounded-xl border border-background-200 bg-background-100/70 px-5">
          {items.map((item) => {
            const quantity = formatIngredientQuantity(item);

            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 py-4 first:pt-5 last:pb-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-text-800">{item.display_name}</p>
                  {quantity && (
                    <p className="mt-1 text-sm text-text-600">{quantity}</p>
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
      <div className="mt-6 border-t border-background-200 pt-6">
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
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={areActionsPending}
            onClick={onComplete}
          >
            <LuCheck className="h-4 w-4" />
            {isCompleting ? 'Finishing...' : 'Finish & view summary'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={areActionsPending}
            onClick={onCancel}
          >
            <LuX className="h-4 w-4" />
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        </div>
      </div>
    </section>
  );
}
