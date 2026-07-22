import { LuNotebookPen } from 'react-icons/lu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function RecipeListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const { data, error, isPending } = useQuery({
    queryKey: ['recipes'],
    queryFn: getRecipes,
  });

  const recipes = data?.data.recipes ?? [];

  const createRecipeMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recipes'] });
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
      await queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setEditingRecipe(null);
    },
  });
  const deleteRecipeMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setDeletingRecipe(null);
    },
  });

  return (
    <main className="min-h-screen bg-background">
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

      {isPending ? (
        <p className="mt-6 text-text-600">Loading recipes…</p>
      ) : error ? (
        <p className="mt-6 text-text-600">
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
