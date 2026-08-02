import { LuNotebookPen } from 'react-icons/lu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  type CreateRecipePayload,
  type Recipe,
  createRecipe,
  deleteRecipe,
  getRecipes,
  updateRecipe,
} from '../services/recipeService';
import Navbar from '../components/layout/Navbar';
import EmptyPage from '../components/ui/EmptyPage';
import RecipeGridPage from '../components/recipes/RecipeGridPage';
import RecipeFormDialog from '../components/recipes/RecipeFormDialog';
import RecipeDeleteDialog from '../components/recipes/RecipeDeleteDialog';
import { RecipeListSkeleton } from '../components/ui/LoadingSkeletons';
import { queryKeys } from '../utils/queryKeys';

export default function RecipeListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const { data, error, isPending } = useQuery({
    queryKey: queryKeys.recipes.all,
    queryFn: getRecipes,
  });

  const recipes = data?.data.recipes ?? [];

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
    mutationFn: createRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      setIsCreateFormOpen(false);
    },
  });
  const updateRecipeMutation = useMutation({
    mutationFn: ({
      recipeId,
      payload,
    }: {
      recipeId: number;
      payload: CreateRecipePayload;
    }) => updateRecipe(recipeId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      setEditingRecipe(null);
    },
  });
  const deleteRecipeMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      setDeletingRecipe(null);
    },
  });

  if (isPending) {
    return <RecipeListSkeleton />;
  }

  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      {isCreateFormOpen && (
        <RecipeFormDialog
          error={createRecipeMutation.error}
          isPending={createRecipeMutation.isPending}
          onCancel={() => setIsCreateFormOpen(false)}
          onSubmit={(payload) => createRecipeMutation.mutate(payload)}
        />
      )}
      {editingRecipe && (
        <RecipeFormDialog
          key={editingRecipe.id}
          recipe={editingRecipe}
          error={updateRecipeMutation.error}
          isPending={updateRecipeMutation.isPending}
          onCancel={() => setEditingRecipe(null)}
          onSubmit={(payload) =>
            updateRecipeMutation.mutate({
              recipeId: editingRecipe.id,
              payload,
            })
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
