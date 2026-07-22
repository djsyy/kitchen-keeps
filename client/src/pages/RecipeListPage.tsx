import { LuBookOpen } from 'react-icons/lu';
import { useQuery } from '@tanstack/react-query';
import { getRecipes } from '../services/recipeService';
import Navbar from '../components/layout/Navbar';
import EmptyPage from '../components/ui/EmptyPage';
import RecipeGridPage from '../components/recipes/RecipeGridPage';

export default function RecipeListPage() {
  const { data, error, isPending } = useQuery({
    queryKey: ['recipes'],
    queryFn: getRecipes,
  });

  const recipes = data?.data.recipes ?? [];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {isPending ? (
        <p className="mt-6 text-text-600">Loading recipes…</p>
      ) : error ? (
        <p className="mt-6 text-text-600">
          We couldn’t load your recipes. Please try again.
        </p>
      ) : recipes.length === 0 ? (
        <EmptyPage
          icon={LuBookOpen}
          title="No recipes yet"
          description="Recipes you create will appear here. You’ll be able to search them and add them to libraries."
        />
      ) : (
        <RecipeGridPage />
      )}
    </main>
  );
}
