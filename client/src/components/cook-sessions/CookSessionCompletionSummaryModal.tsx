import type { CookSessionItem } from '../../services/cookSessionService';
import { formatIngredientQuantity } from '../../utils/recipeDisplay';

type CookSessionCompletionSummaryModalProps = {
  recipeTitle: string;
  neededItems: CookSessionItem[];
  unsureItems: CookSessionItem[];
  availableItems: CookSessionItem[];
  onClose: () => void;
};

export default function CookSessionCompletionSummaryModal({
  recipeTitle,
  neededItems,
  unsureItems,
  availableItems,
  onClose,
}: CookSessionCompletionSummaryModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-summary-title"
        aria-describedby="completion-summary-description"
        className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-background-50 p-6 shadow-xl sm:p-8"
      >
        <p className="text-sm font-bold uppercase tracking-wide text-text-500">
          Prep list complete
        </p>
        <h1
          id="completion-summary-title"
          className="mt-1 text-2xl font-bold text-text-950"
        >
          Ingredient Summary
        </h1>
        <p className="mt-1 text-sm font-bold text-text-800">{recipeTitle}</p>
        <p
          id="completion-summary-description"
          className="mt-2 text-sm leading-6 text-text-600"
        >
          Keep this summary and take a screenshot.
        </p>

        <dl className="mt-6 divide-y divide-background-200 rounded-xl border border-background-200 bg-background-100/70 px-4">
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="font-bold text-secondary-900">Have it</dt>
            <dd className="text-lg font-bold text-secondary-950">
              {availableItems.length}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="font-bold text-text-800">Not sure</dt>
            <dd className="text-lg font-bold text-text-950">
              {unsureItems.length}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="font-bold text-primary-900">Need it</dt>
            <dd className="text-lg font-bold text-primary-950">
              {neededItems.length}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SummaryItemList
            heading="Missing"
            emptyMessage="Nothing was marked as needed."
            items={neededItems}
            itemClassName="border-primary-200 bg-primary-50 text-primary-950"
            quantityClassName="text-primary-800"
          />
          <SummaryItemList
            heading="Not sure"
            emptyMessage="Nothing was left unknown."
            items={unsureItems}
            itemClassName="border-background-300 bg-background-100 text-text-900"
            quantityClassName="text-text-700"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
            onClick={onClose}
            autoFocus
          >
            Back to recipe
          </button>
        </div>
      </section>
    </div>
  );
}

type SummaryItemListProps = {
  heading: string;
  emptyMessage: string;
  items: CookSessionItem[];
  itemClassName: string;
  quantityClassName: string;
};

function SummaryItemList({
  heading,
  emptyMessage,
  items,
  itemClassName,
  quantityClassName,
}: SummaryItemListProps) {
  return (
    <section>
      <h2 className="text-lg font-bold text-text-950">{heading}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-text-600">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => {
            const quantity = formatIngredientQuantity(item);

            return (
              <li
                key={item.id}
                className={`rounded-lg border px-3 py-2 text-sm ${itemClassName}`}
              >
                <span className="font-bold">{item.display_name}</span>
                {quantity && (
                  <span className={`ml-2 ${quantityClassName}`}>{quantity}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
