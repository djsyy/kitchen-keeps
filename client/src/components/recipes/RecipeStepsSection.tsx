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
import { queryKeys } from '../../utils/queryKeys';
import ErrorMessage from '../ui/ErrorMessage';
import { StepListSkeleton } from '../ui/LoadingSkeletons';
import RecipeStepDeleteDialog from './RecipeStepDeleteDialog';
import RecipeStepFormDialog from './RecipeStepFormDialog';

export default function RecipeStepsSection({ recipeId }: { recipeId: number }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingStep, setEditingStep] = useState<RecipeStep | null>(null);
  const [deletingStep, setDeletingStep] = useState<RecipeStep | null>(null);
  const stepQueryKey = queryKeys.recipes.steps(recipeId);
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
    <section className="border-background-300 bg-background-50 relative overflow-hidden rounded-2xl border-2 border-t-0 p-6 shadow-lg sm:p-8">
      <div
        aria-hidden="true"
        className="bg-secondary absolute inset-x-0 top-0 h-1.5"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-text-500 text-sm font-bold tracking-wide uppercase">
            Recipe instructions
          </p>
          <h2 className="text-text-950 mt-1 text-2xl font-bold">Steps</h2>
          <p className="text-text-600 mt-1 text-sm">
            Follow each step from start to finish.
          </p>
        </div>
        <button
          type="button"
          className="bg-secondary text-background-50 hover:bg-secondary-700 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition"
          onClick={() => setIsAdding(true)}
        >
          <LuPlus className="h-4 w-4" />
          Add step
        </button>
      </div>

      <ol className="mt-8 space-y-1">
        {isPending ? (
          <li>
            <StepListSkeleton />
          </li>
        ) : isError ? (
          <li className="text-text-600 py-5 text-sm">
            We couldn’t load the recipe steps. Please try again.
          </li>
        ) : recipeSteps.length === 0 ? (
          <li className="border-background-300 text-text-600 rounded-xl border border-dashed px-5 py-8 text-center text-sm">
            No steps have been added yet.
          </li>
        ) : (
          recipeSteps.map((step, index) => (
            <li
              key={step.id}
              className="text-text-700 relative flex items-start gap-4 py-3 text-sm leading-6"
            >
              {index < recipeSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="bg-background-300 absolute top-9 left-3.5 h-[calc(100%-0.5rem)] w-px"
                />
              )}
              <span className="bg-secondary-100 text-secondary-800 relative z-10 mt-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold">
                {index + 1}
              </span>
              <p className="bg-background-100/60 text-text-700 min-w-0 flex-1 rounded-lg px-3 py-2.5">
                {step.instruction}
              </p>
              <div className="flex shrink-0 items-start gap-2">
                <div className="border-background-200 bg-background-50 flex rounded-md border">
                  <button
                    type="button"
                    aria-label={`Move step ${index + 1} up`}
                    className="text-text-600 hover:bg-background-100 p-2 transition disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={index === 0 || reorderMutation.isPending}
                    onClick={() => moveStep(step.id, -1)}
                  >
                    <LuArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move step ${index + 1} down`}
                    className="border-background-200 text-text-600 hover:bg-background-100 border-l p-2 transition disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="text-text-600 hover:bg-background-100 hover:text-primary rounded-md p-2 transition"
                  onClick={() => setEditingStep(step)}
                >
                  <LuPencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete step ${index + 1}`}
                  className="text-text-600 hover:bg-primary-50 hover:text-primary rounded-md p-2 transition"
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
