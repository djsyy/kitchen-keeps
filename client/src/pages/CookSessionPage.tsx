import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import CookSessionCompletionSummaryModal from '../components/cook-sessions/CookSessionCompletionSummaryModal';
import CookSessionIngredientsSection from '../components/cook-sessions/CookSessionIngredientsSection';
import ExpiredCookSessionDialog from '../components/cook-sessions/ExpiredCookSessionDialog';
import Navbar from '../components/layout/Navbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import {
  acknowledgeCookSessionExpiry,
  cancelCookSession,
  completeCookSession,
  createCookSession,
  getCookSession,
  type CookSessionDetailResponse,
  type CookSessionItemStatus,
  updateCookSessionItem,
} from '../services/cookSessionService';
import { queryKeys } from '../utils/queryKeys';

export default function CookSessionPage() {
  const { id } = useParams();
  const cookSessionId = Number(id);
  const isValidCookSessionId =
    Number.isInteger(cookSessionId) && cookSessionId > 0;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCompletionSummaryOpen, setIsCompletionSummaryOpen] = useState(false);
  const cookSessionQueryKey = queryKeys.cookSessions.detail(cookSessionId);
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
  const shouldShowExpiryPrompt =
    cookSession?.cancellation_reason === 'expired' &&
    !cookSession.expired_prompt_seen_at;
  const shouldRedirectToRecipe =
    cookSession !== undefined &&
    cookSession.status !== 'active' &&
    !shouldShowExpiryPrompt &&
    !isCompletionSummaryOpen;
  const acknowledgeExpiryMutation = useMutation({
    mutationFn: () => acknowledgeCookSessionExpiry(cookSessionId),
    onSuccess: () => {
      navigate(`/recipes/${cookSession?.recipe_id}`, { replace: true });
    },
  });
  const createReplacementMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      await acknowledgeCookSessionExpiry(cookSessionId);
      return createCookSession(recipeId);
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cookSessions.all });
      navigate(`/cook-sessions/${data.cookSession.id}`, { replace: true });
    },
  });
  const updateItemMutation = useMutation({
    mutationFn: ({
      cookSessionItemId,
      status,
    }: {
      cookSessionItemId: number;
      status: CookSessionItemStatus;
    }) => updateCookSessionItem(cookSessionId, cookSessionItemId, { status }),
    onSuccess: ({ data: { cookSessionItem } }) => {
      queryClient.setQueryData<CookSessionDetailResponse>(
        cookSessionQueryKey,
        (currentCookSession) => {
          if (!currentCookSession) {
            return currentCookSession;
          }

          return {
            ...currentCookSession,
            data: {
              ...currentCookSession.data,
              items: currentCookSession.data.items.map((item) =>
                item.id === cookSessionItem.id ? cookSessionItem : item
              ),
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: cookSessionQueryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.cookSessions.all });
    },
  });
  const completeMutation = useMutation({
    mutationFn: () => completeCookSession(cookSessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cookSessions.all });
      queryClient.invalidateQueries({ queryKey: cookSessionQueryKey });
      setIsCompletionSummaryOpen(true);
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelCookSession(cookSessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cookSessions.all });
      navigate(`/recipes/${cookSession?.recipe_id}`, { replace: true });
    },
  });

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
        ) : shouldRedirectToRecipe ? (
          <Navigate to={`/recipes/${cookSession.recipe_id}`} replace />
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

            {cookSession.status === 'cancelled' && (
              <section
                className="rounded-2xl border border-background-300 bg-background-100 p-5"
                role="status"
              >
                <h2 className="text-lg font-bold text-text-950">
                  This prep list is no longer active
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-700">
                  It was cancelled and can no longer be changed. Return to the
                  recipe to start a fresh prep list.
                </p>
              </section>
            )}

            {cookSession.status === 'active' && (
              <CookSessionIngredientsSection
                items={items}
                isUpdatingItem={updateItemMutation.isPending}
                isCompleting={completeMutation.isPending}
                isCancelling={cancelMutation.isPending}
                updateError={updateItemMutation.error}
                completeError={completeMutation.error}
                cancelError={cancelMutation.error}
                onUpdateItem={(cookSessionItemId, status) =>
                  updateItemMutation.mutate({ cookSessionItemId, status })
                }
                onComplete={() => completeMutation.mutate()}
                onCancel={() => cancelMutation.mutate()}
              />
            )}
          </div>
        )}
      </div>
      {isCompletionSummaryOpen && cookSession && (
        <CookSessionCompletionSummaryModal
          recipeTitle={cookSession.recipe_title}
          neededItems={neededItems}
          unsureItems={unsureItems}
          availableItems={availableItems}
          onClose={() =>
            navigate(`/recipes/${cookSession.recipe_id}`, { replace: true })
          }
        />
      )}
      {shouldShowExpiryPrompt && cookSession && (
        <ExpiredCookSessionDialog
          recipeTitle={cookSession.recipe_title}
          isPending={
            acknowledgeExpiryMutation.isPending ||
            createReplacementMutation.isPending
          }
          error={
            createReplacementMutation.error ?? acknowledgeExpiryMutation.error
          }
          onCreateNew={() =>
            createReplacementMutation.mutate(cookSession.recipe_id)
          }
          onBack={() => acknowledgeExpiryMutation.mutate()}
        />
      )}
    </main>
  );
}
