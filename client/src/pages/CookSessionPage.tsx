import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LuArrowLeft, LuCheck, LuX } from 'react-icons/lu';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import {
  cancelCookSession,
  completeCookSession,
  getCookSession,
  type CookSessionItem,
  type CookSessionItemStatus,
  updateCookSessionItem,
} from '../services/cookSessionService';

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

const formatQuantity = (item: CookSessionItem) =>
  [item.quantity_value, item.quantity_unit].filter(Boolean).join(' ');

type CompletionSummaryModalProps = {
  recipeTitle: string;
  neededItems: CookSessionItem[];
  unsureItems: CookSessionItem[];
  availableItems: CookSessionItem[];
  onClose: () => void;
};

function CompletionSummaryModal({
  recipeTitle,
  neededItems,
  unsureItems,
  availableItems,
  onClose,
}: CompletionSummaryModalProps) {
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
          <section>
            <h2 className="text-lg font-bold text-text-950">Missing</h2>
            {neededItems.length === 0 ? (
              <p className="mt-2 text-sm text-text-600">
                Nothing was marked as needed.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {neededItems.map((item) => {
                  const quantity = formatQuantity(item);

                  return (
                    <li
                      key={item.id}
                      className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm text-primary-950"
                    >
                      <span className="font-bold">{item.display_name}</span>
                      {quantity && (
                        <span className="ml-2 text-primary-800">
                          {quantity}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-950">Not sure</h2>
            {unsureItems.length === 0 ? (
              <p className="mt-2 text-sm text-text-600">
                Nothing was left unknown.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {unsureItems.map((item) => {
                  const quantity = formatQuantity(item);

                  return (
                    <li
                      key={item.id}
                      className="rounded-lg border border-background-300 bg-background-100 px-3 py-2 text-sm text-text-900"
                    >
                      <span className="font-bold">{item.display_name}</span>
                      {quantity && (
                        <span className="ml-2 text-text-700">{quantity}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
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

export default function CookSessionPage() {
  const { id } = useParams();
  const cookSessionId = Number(id);
  const isValidCookSessionId =
    Number.isInteger(cookSessionId) && cookSessionId > 0;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCompletionSummaryOpen, setIsCompletionSummaryOpen] = useState(false);
  const cookSessionQueryKey = ['cook-sessions', cookSessionId] as const;
  const { data, error, isPending } = useQuery({
    queryKey: cookSessionQueryKey,
    queryFn: () => getCookSession(cookSessionId),
    enabled: isValidCookSessionId,
  });

  const cookSession = data?.data.cookSession;
  const items = data?.data.items ?? [];
  const neededItems = items.filter((item) => item.status === 'need');
  const unsureItems = items.filter((item) => item.status === 'unknown');
  const availableItems = items.filter((item) => item.status === 'have');
  const updateItemMutation = useMutation({
    mutationFn: ({
      cookSessionItemId,
      status,
    }: {
      cookSessionItemId: number;
      status: CookSessionItemStatus;
    }) => updateCookSessionItem(cookSessionId, cookSessionItemId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cookSessionQueryKey });
      queryClient.invalidateQueries({ queryKey: ['cook-sessions'] });
    },
  });
  const completeMutation = useMutation({
    mutationFn: () => completeCookSession(cookSessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cook-sessions'] });
      queryClient.invalidateQueries({ queryKey: cookSessionQueryKey });
      setIsCompletionSummaryOpen(true);
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelCookSession(cookSessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cook-sessions'] });
      navigate(`/recipes/${cookSession?.recipe_id}`, { replace: true });
    },
  });
  const isClosing = completeMutation.isPending || cancelMutation.isPending;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {!isValidCookSessionId ? (
          <ErrorMessage message="This prep list link is invalid." />
        ) : isPending ? (
          <p className="text-text-600">Loading your prep list…</p>
        ) : error || !cookSession ? (
          <ErrorMessage message="We couldn’t load this prep list. Please try again." />
        ) : (
          <div className="space-y-8">
            <Link
              to={`/recipes/${cookSession.recipe_id}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-text-600 transition hover:text-text-950"
            >
              <LuArrowLeft className="h-4 w-4" />
              Back to recipe
            </Link>

            <section className="rounded-2xl border border-background-300 bg-background-50 p-6 shadow-lg sm:p-8">
              <p className="text-sm font-bold uppercase tracking-wide text-text-500">
                Prep list
              </p>
              <h1 className="mt-1 text-3xl font-bold text-text-950">
                What do I need for {cookSession.recipe_title}?
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-600">
                Check off the ingredients you have to discover what&apos;s
                missing.
              </p>
            </section>

            <section className="rounded-2xl border border-background-300 bg-background-50 p-6 shadow-lg sm:p-8">
              <h2 className="text-2xl font-bold text-text-950">Ingredients</h2>
              {items.length === 0 ? (
                <p className="mt-5 text-sm text-text-600">
                  This recipe did not have any ingredients when this prep list
                  started.
                </p>
              ) : (
                <ul className="mt-5 divide-y divide-background-200 rounded-xl border border-background-200 bg-background-100/70 px-5">
                  {items.map((item) => {
                    const quantity = formatQuantity(item);
                    const isActive = cookSession.status === 'active';

                    return (
                      <li
                        key={item.id}
                        className="flex flex-col gap-3 py-4 first:pt-5 last:pb-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-bold text-text-800">
                            {item.display_name}
                          </p>
                          {quantity && (
                            <p className="mt-1 text-sm text-text-600">
                              {quantity}
                            </p>
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
                                disabled={
                                  !isActive ||
                                  isClosing ||
                                  updateItemMutation.isPending
                                }
                                onClick={() =>
                                  updateItemMutation.mutate({
                                    cookSessionItemId: item.id,
                                    status: option.status,
                                  })
                                }
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
              {updateItemMutation.error && (
                <ErrorMessage
                  className="mt-4"
                  message={updateItemMutation.error.message}
                />
              )}
              {cookSession.status === 'active' && (
                <div className="mt-6 border-t border-background-200 pt-6">
                  {(completeMutation.error || cancelMutation.error) && (
                    <ErrorMessage
                      className="mb-4"
                      message={
                        completeMutation.error?.message ??
                        cancelMutation.error?.message ??
                        'Unable to update this prep list.'
                      }
                    />
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isClosing}
                      onClick={() => completeMutation.mutate()}
                    >
                      <LuCheck className="h-4 w-4" />
                      {completeMutation.isPending
                        ? 'Preparing...'
                        : 'View summary'}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isClosing}
                      onClick={() => cancelMutation.mutate()}
                    >
                      <LuX className="h-4 w-4" />
                      {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      {isCompletionSummaryOpen && cookSession && (
        <CompletionSummaryModal
          recipeTitle={cookSession.recipe_title}
          neededItems={neededItems}
          unsureItems={unsureItems}
          availableItems={availableItems}
          onClose={() =>
            navigate(`/recipes/${cookSession.recipe_id}`, { replace: true })
          }
        />
      )}
    </main>
  );
}
