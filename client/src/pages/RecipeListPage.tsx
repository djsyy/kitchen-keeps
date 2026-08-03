import { LuNotebookPen } from 'react-icons/lu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  type Recipe,
  createRecipe,
  deleteRecipe,
  getRecipes,
  removeRecipeImage,
  uploadRecipeImage,
  updateRecipe,
} from '../services/recipeService';
import Navbar from '../components/layout/Navbar';
import EmptyPage from '../components/ui/EmptyPage';
import RecipeGridPage from '../components/recipes/RecipeGridPage';
import RecipeFormDialog, {
  type RecipeFormSubmission,
  type RecipeImageAction,
} from '../components/recipes/RecipeFormDialog';
import RecipeDeleteDialog from '../components/recipes/RecipeDeleteDialog';
import { RecipeListSkeleton } from '../components/ui/LoadingSkeletons';
import { queryKeys } from '../utils/queryKeys';

type PendingImageAction = {
  recipeId: number;
  imageAction: Exclude<RecipeImageAction, { type: 'unchanged' }>;
  form: 'create' | 'edit';
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

export default function RecipeListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [pendingImageAction, setPendingImageAction] =
    useState<PendingImageAction | null>(null);
  const { data, error, isPending } = useQuery({
    queryKey: queryKeys.recipes.all,
    queryFn: getRecipes,
  });

  const recipes = data?.data.recipes ?? [];

  const invalidateRecipeViews = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
      queryClient.invalidateQueries({ queryKey: queryKeys.libraries.all }),
    ]);
  };

  useEffect(() => {
    if (searchParams.get('create') !== '1') {
      return;
    }

    setIsCreateFormOpen(true);
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('create');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const createRecipeMutation = useMutation({
    mutationFn: async ({ payload, imageAction }: RecipeFormSubmission) => {
      const response = await createRecipe(payload);
      const recipe = response.data.recipe;

      try {
        await runRecipeImageAction(recipe.id, imageAction);
      } catch (error) {
        if (imageAction.type !== 'unchanged') {
          throw new RecipeImageActionError(
            {
              recipeId: recipe.id,
              imageAction,
              form: 'create',
            },
            error
          );
        }

        throw error;
      }
    },
    onSuccess: async () => {
      await invalidateRecipeViews();
      setIsCreateFormOpen(false);
      setPendingImageAction(null);
    },
    onError: (error) => {
      if (error instanceof RecipeImageActionError) {
        setPendingImageAction(error.pendingImageAction);
      }
    },
  });
  const updateRecipeMutation = useMutation({
    mutationFn: ({
      recipeId,
      submission,
    }: {
      recipeId: number;
      submission: RecipeFormSubmission;
    }) =>
      (async () => {
        await updateRecipe(recipeId, submission.payload);

        try {
          await runRecipeImageAction(recipeId, submission.imageAction);
        } catch (error) {
          if (submission.imageAction.type !== 'unchanged') {
            throw new RecipeImageActionError(
              {
                recipeId,
                imageAction: submission.imageAction,
                form: 'edit',
              },
              error
            );
          }

          throw error;
        }
      })(),
    onSuccess: async () => {
      await invalidateRecipeViews();
      setEditingRecipe(null);
      setPendingImageAction(null);
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
  const deleteRecipeMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: async () => {
      await invalidateRecipeViews();
      setDeletingRecipe(null);
    },
  });

  const retryPendingImageAction = () => {
    if (!pendingImageAction) {
      return;
    }

    retryImageActionMutation.mutate(pendingImageAction, {
      onSuccess: async () => {
        await invalidateRecipeViews();

        if (pendingImageAction.form === 'create') {
          setIsCreateFormOpen(false);
        } else {
          setEditingRecipe(null);
        }

        setPendingImageAction(null);
      },
    });
  };

  const continueWithoutImage = async () => {
    if (!pendingImageAction) {
      return;
    }

    if (pendingImageAction.form === 'create') {
      setIsCreateFormOpen(false);
    } else {
      setEditingRecipe(null);
    }

    setPendingImageAction(null);
    await invalidateRecipeViews();
  };

  const getFormError = (
    form: PendingImageAction['form'],
    error: Error | null
  ) =>
    pendingImageAction?.form === form
      ? (retryImageActionMutation.error ?? pendingImageAction.error)
      : error;

  if (isPending) {
    return <RecipeListSkeleton />;
  }

  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      {isCreateFormOpen && (
        <RecipeFormDialog
          error={getFormError('create', createRecipeMutation.error)}
          isPending={
            createRecipeMutation.isPending || retryImageActionMutation.isPending
          }
          onCancel={() => {
            setPendingImageAction(null);
            setIsCreateFormOpen(false);
          }}
          onSubmit={(submission) => createRecipeMutation.mutate(submission)}
          onRetryImageAction={
            pendingImageAction?.form === 'create'
              ? retryPendingImageAction
              : undefined
          }
          onContinueWithoutImage={
            pendingImageAction?.form === 'create'
              ? continueWithoutImage
              : undefined
          }
        />
      )}
      {editingRecipe && (
        <RecipeFormDialog
          key={editingRecipe.id}
          recipe={editingRecipe}
          error={getFormError('edit', updateRecipeMutation.error)}
          isPending={
            updateRecipeMutation.isPending || retryImageActionMutation.isPending
          }
          onCancel={() => {
            setPendingImageAction(null);
            setEditingRecipe(null);
          }}
          onSubmit={(submission) =>
            updateRecipeMutation.mutate({
              recipeId: editingRecipe.id,
              submission,
            })
          }
          onRetryImageAction={
            pendingImageAction?.form === 'edit'
              ? retryPendingImageAction
              : undefined
          }
          onContinueWithoutImage={
            pendingImageAction?.form === 'edit'
              ? continueWithoutImage
              : undefined
          }
        />
      )}
      {deletingRecipe && (
        <RecipeDeleteDialog
          recipe={deletingRecipe}
          error={deleteRecipeMutation.error}
          isPending={deleteRecipeMutation.isPending}
          onCancel={() => setDeletingRecipe(null)}
          onConfirm={() => deleteRecipeMutation.mutate(deletingRecipe.id)}
        />
      )}

      {error ? (
        <p className="text-text-600 mt-6">
          We couldn’t load your recipes. Please try again.
        </p>
      ) : recipes.length === 0 ? (
        <EmptyPage
          icon={LuNotebookPen}
          title="No recipes yet"
          description="Recipes you create will appear here. You’ll be able to search them and add them to libraries."
          action={{
            label: 'Create a recipe',
            onClick: () => setIsCreateFormOpen(true),
          }}
        />
      ) : (
        <RecipeGridPage
          recipes={recipes}
          onCreate={() => setIsCreateFormOpen(true)}
          onOpen={(recipe) => navigate(`/recipes/${recipe.id}`)}
          onEdit={setEditingRecipe}
          onDelete={setDeletingRecipe}
        />
      )}
    </main>
  );
}
