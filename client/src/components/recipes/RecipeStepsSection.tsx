import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  LuArrowDown,
  LuArrowUp,
  LuPencil,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import {
  createRecipeStep,
  deleteRecipeStep,
  getRecipeSteps,
  reorderRecipeSteps,
  type RecipeStep,
  type UpdateRecipeStepPayload,
  updateRecipeStep,
} from '../../services/recipeStepService';
import ErrorMessage from '../ui/ErrorMessage';
import RecipeStepDeleteDialog from './RecipeStepDeleteDialog';
import RecipeStepFormDialog from './RecipeStepFormDialog';

export default function RecipeStepsSection({ recipeId }: { recipeId: number }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingStep, setEditingStep] = useState<RecipeStep | null>(null);
  const [deletingStep, setDeletingStep] = useState<RecipeStep | null>(null);
  const stepQueryKey = ['recipes', recipeId, 'steps'] as const;
  const { data, isError, isPending } = useQuery({
    queryKey: stepQueryKey,
    queryFn: () => getRecipeSteps(recipeId),
  });

  const recipeSteps = data?.data.recipeSteps ?? [];
  const invalidateSteps = () =>
    queryClient.invalidateQueries({ queryKey: stepQueryKey });
  const createMutation = useMutation({
    mutationFn: createRecipeStep.bind(null, recipeId),
    onSuccess: () => {
      setIsAdding(false);
      invalidateSteps();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      recipeStepId,
      payload,
    }: {
      recipeStepId: number;
      payload: UpdateRecipeStepPayload;
    }) => updateRecipeStep(recipeId, recipeStepId, payload),
    onSuccess: () => {
      setEditingStep(null);
      invalidateSteps();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (recipeStepId: number) =>
      deleteRecipeStep(recipeId, recipeStepId),
    onSuccess: () => {
      setDeletingStep(null);
      invalidateSteps();
    },
  });
  const reorderMutation = useMutation({
    mutationFn: (recipeStepIds: number[]) =>
      reorderRecipeSteps(recipeId, recipeStepIds),
    onSuccess: invalidateSteps,
  });

  const moveStep = (stepId: number, direction: -1 | 1) => {
    const currentIndex = recipeSteps.findIndex((step) => step.id === stepId);
    const nextIndex = currentIndex + direction;

    if (
      reorderMutation.isPending ||
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= recipeSteps.length
    ) {
      return;
    }

    const reorderedSteps = [...recipeSteps];
    [reorderedSteps[currentIndex], reorderedSteps[nextIndex]] = [
      reorderedSteps[nextIndex],
      reorderedSteps[currentIndex],
    ];
    reorderMutation.mutate(reorderedSteps.map((step) => step.id));
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-t-0 border-background-300 bg-background-50 p-6 shadow-lg sm:p-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 bg-secondary"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-text-500">
            Recipe instructions
          </p>
          <h2 className="mt-1 text-2xl font-bold text-text-950">Steps</h2>
          <p className="mt-1 text-sm text-text-600">
            Follow each step from start to finish.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-background-50 transition hover:bg-secondary-700"
          onClick={() => setIsAdding(true)}
        >
          <LuPlus className="h-4 w-4" />
          Add step
        </button>
      </div>

      <ol className="mt-8 space-y-1">
        {isPending ? (
          <li className="py-5 text-sm text-text-600">Loading steps…</li>
        ) : isError ? (
          <li className="py-5 text-sm text-text-600">
            We couldn’t load the recipe steps. Please try again.
          </li>
        ) : recipeSteps.length === 0 ? (
          <li className="rounded-xl border border-dashed border-background-300 px-5 py-8 text-center text-sm text-text-600">
            No steps have been added yet.
          </li>
        ) : (
          recipeSteps.map((step, index) => (
            <li
              key={step.id}
              className="relative flex items-start gap-4 py-3 text-sm leading-6 text-text-700"
            >
              {index < recipeSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-3.5 top-9 h-[calc(100%-0.5rem)] w-px bg-background-300"
                />
              )}
              <span className="relative z-10 mt-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-100 font-bold text-secondary-800">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 rounded-lg bg-background-100/60 px-3 py-2.5 text-text-700">
                {step.instruction}
              </p>
              <div className="flex shrink-0 items-start gap-2">
                <div className="flex rounded-md border border-background-200 bg-background-50">
                  <button
                    type="button"
                    aria-label={`Move step ${index + 1} up`}
                    className="p-2 text-text-600 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={index === 0 || reorderMutation.isPending}
                    onClick={() => moveStep(step.id, -1)}
                  >
                    <LuArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move step ${index + 1} down`}
                    className="border-l border-background-200 p-2 text-text-600 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={
                      index === recipeSteps.length - 1 ||
                      reorderMutation.isPending
                    }
                    onClick={() => moveStep(step.id, 1)}
                  >
                    <LuArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Edit step ${index + 1}`}
                  className="rounded-md p-2 text-text-600 transition hover:bg-background-100 hover:text-primary"
                  onClick={() => setEditingStep(step)}
                >
                  <LuPencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete step ${index + 1}`}
                  className="rounded-md p-2 text-text-600 transition hover:bg-primary-50 hover:text-primary"
                  onClick={() => setDeletingStep(step)}
                >
                  <LuTrash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))
        )}
      </ol>

      {reorderMutation.error && (
        <ErrorMessage
          className="mt-4"
          message={reorderMutation.error.message}
        />
      )}

      {isAdding && (
        <RecipeStepFormDialog
          isPending={createMutation.isPending}
          error={createMutation.error}
          onCancel={() => setIsAdding(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}
      {editingStep && (
        <RecipeStepFormDialog
          recipeStep={editingStep}
          isPending={updateMutation.isPending}
          error={updateMutation.error}
          onCancel={() => setEditingStep(null)}
          onSubmit={(payload) =>
            updateMutation.mutate({ recipeStepId: editingStep.id, payload })
          }
        />
      )}
      {deletingStep && (
        <RecipeStepDeleteDialog
          recipeStep={deletingStep}
          isPending={deleteMutation.isPending}
          error={deleteMutation.error}
          onCancel={() => setDeletingStep(null)}
          onConfirm={() => deleteMutation.mutate(deletingStep.id)}
        />
      )}
    </section>
  );
}
