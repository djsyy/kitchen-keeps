import { LuNotebookPen } from 'react-icons/lu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createRecipe, getRecipes } from '../services/recipeService';
import Navbar from '../components/layout/Navbar';
import EmptyPage from '../components/ui/EmptyPage';
import RecipeGridPage from '../components/recipes/RecipeGridPage';
import RecipeFormDialog from '../components/recipes/RecipeFormDialog';

export default function RecipeListPage() {
  const queryClient = useQueryClient();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
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
        />
      )}
    </main>
  );
}
