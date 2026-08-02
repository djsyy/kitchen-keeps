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
      className="bg-text-950/50 fixed inset-0 z-50 flex items-center justify-center p-4"
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
        className="bg-background-50 max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl p-6 shadow-xl sm:p-8"
      >
        <p className="text-text-500 text-sm font-bold tracking-wide uppercase">
          Prep list complete
        </p>
        <h1
          id="completion-summary-title"
          className="text-text-950 mt-1 text-2xl font-bold"
        >
          Ingredient Summary
        </h1>
        <p className="text-text-800 mt-1 text-sm font-bold">{recipeTitle}</p>
        <p
          id="completion-summary-description"
          className="text-text-600 mt-2 text-sm leading-6"
        >
          Keep this summary and take a screenshot.
        </p>

        <dl className="divide-background-200 border-background-200 bg-background-100/70 mt-6 divide-y rounded-xl border px-4">
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="text-secondary-900 font-bold">Have it</dt>
            <dd className="text-secondary-950 text-lg font-bold">
              {availableItems.length}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="text-text-800 font-bold">Not sure</dt>
            <dd className="text-text-950 text-lg font-bold">
              {unsureItems.length}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="text-primary-900 font-bold">Need it</dt>
            <dd className="text-primary-950 text-lg font-bold">
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
            className="bg-primary text-text-50 hover:bg-primary-700 rounded-lg px-4 py-2.5 text-sm font-bold transition"
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
      <h2 className="text-text-950 text-lg font-bold">{heading}</h2>
      {items.length === 0 ? (
        <p className="text-text-600 mt-2 text-sm">{emptyMessage}</p>
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
                  <span className={`ml-2 ${quantityClassName}`}>
                    {quantity}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
