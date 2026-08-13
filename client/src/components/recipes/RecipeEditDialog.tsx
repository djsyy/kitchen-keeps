import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  type Recipe,
  removeRecipeImage,
  updateRecipe,
  uploadRecipeImage,
} from '../../services/recipeService';
import { queryKeys } from '../../utils/queryKeys';
import RecipeFormDialog, {
  type RecipeFormSubmission,
  type RecipeImageAction,
} from './RecipeFormDialog';

type PendingImageAction = {
  recipeId: number;
  imageAction: Exclude<RecipeImageAction, { type: 'unchanged' }>;
  error: Error;
};

class RecipeImageActionError extends Error {
  pendingImageAction: PendingImageAction;

  constructor(
    pendingImageAction: Omit<PendingImageAction, 'error'>,
    cause: unknown
  ) {
    const error =
      cause instanceof Error
        ? cause
        : new Error('Unable to update recipe image');

    super(error.message);
    this.name = 'RecipeImageActionError';
    this.pendingImageAction = { ...pendingImageAction, error };
  }
}

const runRecipeImageAction = async (
  recipeId: number,
  imageAction: RecipeImageAction
) => {
  if (imageAction.type === 'upload') {
    await uploadRecipeImage(recipeId, imageAction.file);
  }

  if (imageAction.type === 'remove') {
    await removeRecipeImage(recipeId);
  }
};

export default function RecipeEditDialog({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [pendingImageAction, setPendingImageAction] =
    useState<PendingImageAction | null>(null);

  const invalidateRecipeViews = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.detail(recipe.id),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
      queryClient.invalidateQueries({ queryKey: queryKeys.libraries.all }),
    ]);

  const updateRecipeMutation = useMutation({
    mutationFn: async (submission: RecipeFormSubmission) => {
      await updateRecipe(recipe.id, submission.payload);

      try {
        await runRecipeImageAction(recipe.id, submission.imageAction);
      } catch (error) {
        if (submission.imageAction.type !== 'unchanged') {
          throw new RecipeImageActionError(
            {
              recipeId: recipe.id,
              imageAction: submission.imageAction,
            },
            error
          );
        }

        throw error;
      }
    },
    onSuccess: async () => {
      await invalidateRecipeViews();
      setPendingImageAction(null);
      onClose();
    },
    onError: (error) => {
      if (error instanceof RecipeImageActionError) {
        setPendingImageAction(error.pendingImageAction);
      }
    },
  });
  const retryImageActionMutation = useMutation({
    mutationFn: ({ recipeId, imageAction }: PendingImageAction) =>
      runRecipeImageAction(recipeId, imageAction),
  });

  const retryPendingImageAction = () => {
    if (!pendingImageAction) {
      return;
    }

    retryImageActionMutation.mutate(pendingImageAction, {
      onSuccess: async () => {
        await invalidateRecipeViews();
        setPendingImageAction(null);
        onClose();
      },
    });
  };

  const continueWithoutImage = async () => {
    setPendingImageAction(null);
    await invalidateRecipeViews();
    onClose();
  };

  return (
    <RecipeFormDialog
      key={recipe.id}
      recipe={recipe}
      error={retryImageActionMutation.error ?? updateRecipeMutation.error}
      isPending={
        updateRecipeMutation.isPending || retryImageActionMutation.isPending
      }
      onCancel={() => {
        updateRecipeMutation.reset();
        retryImageActionMutation.reset();
        setPendingImageAction(null);
        onClose();
      }}
      onChange={() => {
        updateRecipeMutation.reset();
        retryImageActionMutation.reset();
      }}
      onSubmit={(submission) => updateRecipeMutation.mutate(submission)}
      onRetryImageAction={
        pendingImageAction ? retryPendingImageAction : undefined
      }
      onContinueWithoutImage={
        pendingImageAction ? continueWithoutImage : undefined
      }
    />
  );
}
