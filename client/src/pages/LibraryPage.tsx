import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  LuArrowLeft,
  LuBookOpen,
  LuClock3,
  LuEllipsisVertical,
  LuNotebookPen,
  LuPencil,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LibraryDeleteDialog from '../components/library/LibraryDeleteDialog';
import LibraryFormDialog from '../components/library/LibraryFormDialog';
import LibraryRecipePickerDialog from '../components/library/LibraryRecipePickerDialog';
import Navbar from '../components/layout/Navbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import { libraryColorClasses, libraryIcons } from '../config/libraryIcons';
import {
  addRecipeToLibrary,
  deleteLibrary,
  getLibrary,
  removeRecipeFromLibrary,
  type CreateLibraryPayload,
  updateLibrary,
} from '../services/libraryService';
import type { Recipe } from '../services/recipeService';

function formatCreatedDate(createdAt?: string) {
  if (!createdAt) {
    return 'Recently created';
  }

  return `Created ${new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt))}`;
}

export default function LibraryPage() {
  const { id } = useParams();
  const libraryId = Number(id);
  const isValidLibraryId = Number.isInteger(libraryId) && libraryId > 0;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data, error, isPending } = useQuery({
    queryKey: ['libraries', libraryId],
    queryFn: () => getLibrary(libraryId),
    enabled: isValidLibraryId,
  });

  const library = data?.data.library;
  const recipes = data?.data.recipes ?? [];
  const addRecipeMutation = useMutation({
    mutationFn: (recipeId: number) => addRecipeToLibrary(libraryId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraries', libraryId] });
    },
  });
  const removeRecipeMutation = useMutation({
    mutationFn: (recipeId: number) =>
      removeRecipeFromLibrary(libraryId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraries', libraryId] });
    },
  });
  const updateLibraryMutation = useMutation({
    mutationFn: (payload: CreateLibraryPayload) =>
      updateLibrary(libraryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraries'] });
      queryClient.invalidateQueries({ queryKey: ['libraries', libraryId] });
      setIsEditFormOpen(false);
    },
  });
  const deleteLibraryMutation = useMutation({
    mutationFn: () => deleteLibrary(libraryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraries'] });
      navigate('/library', { replace: true });
    },
  });
  const LibraryIcon = library ? libraryIcons[library.icon_key] : LuBookOpen;
  const colorClass = library
    ? libraryColorClasses[library.color_key]
    : libraryColorClasses.primary;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-600 transition hover:text-text-950"
        >
          <LuArrowLeft className="h-4 w-4" />
          All libraries
        </Link>

        {!isValidLibraryId ? (
          <div className="mt-6">
            <ErrorMessage message="This library link is invalid." />
          </div>
        ) : isPending ? (
          <p className="mt-6 text-text-600">Loading library…</p>
        ) : error || !library ? (
          <div className="mt-6">
            <ErrorMessage message="We couldn’t load this library. Please try again." />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)]">
            <aside className="h-fit rounded-3xl border border-background-300 bg-background-50 p-6 shadow-sm">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${colorClass}`}
              >
                <LibraryIcon className="h-7 w-7" />
              </span>
              <h1 className="mt-5 text-3xl font-bold text-text-950">
                {library.name}
              </h1>
              {library.description && (
                <p className="mt-3 text-sm leading-6 text-text-600">
                  {library.description}
                </p>
              )}

              <div className="mt-6 border-t border-background-200 pt-5 text-sm text-text-500">
                <p className="flex items-center gap-2">
                  <LuClock3 className="h-4 w-4" />
                  {formatCreatedDate(library.created_at)}
                </p>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-background-300 px-3 py-2 text-sm font-bold text-text-700 hover:bg-background-100"
                  onClick={() => setIsEditFormOpen(true)}
                >
                  <LuPencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  aria-label="Delete library"
                  className="rounded-lg border border-background-300 p-2 text-text-600 hover:bg-background-100"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <LuTrash2 className="h-4 w-4" />
                </button>
              </div>
            </aside>

            <section className="rounded-3xl border border-background-300 bg-background-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-text-500">
                    Collection
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-text-950">
                    Recipes
                  </h2>
                  <p className="mt-1 text-sm text-text-600">
                    Recipes you add to {library.name} will appear here.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
                  onClick={() => setIsRecipePickerOpen(true)}
                >
                  <LuPlus className="h-4 w-4" />
                  Add recipe
                </button>
              </div>

              {removeRecipeMutation.error && (
                <ErrorMessage
                  className="mt-5"
                  message={removeRecipeMutation.error.message}
                />
              )}

              {recipes.length > 0 ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {recipes.map((recipe) => {
                    const isRemoving =
                      removeRecipeMutation.isPending &&
                      removeRecipeMutation.variables === recipe.id;

                    return (
                      <LibraryRecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        isRemoving={isRemoving}
                        isRemovalPending={removeRecipeMutation.isPending}
                        onRemove={() => removeRecipeMutation.mutate(recipe.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-background-300 px-6 py-14 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-background-100 text-text-600">
                    <LuBookOpen className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-text-950">
                    No recipes in this library yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-600">
                    Add recipes here to keep this collection organized and easy
                    to browse.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      {isRecipePickerOpen && library && (
        <LibraryRecipePickerDialog
          memberRecipeIds={recipes.map((recipe) => recipe.id)}
          isPending={addRecipeMutation.isPending}
          error={addRecipeMutation.error}
          onAdd={(recipeId) => addRecipeMutation.mutate(recipeId)}
          onClose={() => setIsRecipePickerOpen(false)}
        />
      )}
      {isEditFormOpen && library && (
        <LibraryFormDialog
          key={library.id}
          library={library}
          isPending={updateLibraryMutation.isPending}
          error={updateLibraryMutation.error}
          onCancel={() => setIsEditFormOpen(false)}
          onSubmit={(payload) => updateLibraryMutation.mutate(payload)}
        />
      )}
      {isDeleteDialogOpen && library && (
        <LibraryDeleteDialog
          library={library}
          isPending={deleteLibraryMutation.isPending}
          error={deleteLibraryMutation.error}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => deleteLibraryMutation.mutate()}
        />
      )}
    </main>
  );
}

type LibraryRecipeCardProps = {
  recipe: Recipe;
  isRemoving: boolean;
  isRemovalPending: boolean;
  onRemove: () => void;
};

function LibraryRecipeCard({
  recipe,
  isRemoving,
  isRemovalPending,
  onRemove,
}: LibraryRecipeCardProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  useEffect(() => {
    if (!isOptionsOpen) {
      return;
    }

    const closeOptionsOnOutsideClick = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOptionsOnOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', closeOptionsOnOutsideClick);
  }, [isOptionsOpen]);

  return (
    <article
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl border border-background-300 bg-background-50 shadow-sm"
    >
      <button
        type="button"
        aria-label={`Show options for ${recipe.title}`}
        aria-expanded={isOptionsOpen}
        aria-haspopup="menu"
        className="absolute top-3 right-3 z-10 rounded-md bg-background-50/90 p-1 text-text-600 transition hover:bg-background-100 hover:text-text-950"
        onClick={() => setIsOptionsOpen((isOpen) => !isOpen)}
      >
        <LuEllipsisVertical className="h-5 w-5" />
      </button>
      {isOptionsOpen && (
        <div
          role="menu"
          className="absolute top-12 right-3 z-10 w-44 rounded-lg border border-background-300 bg-background-50 p-1 shadow-md"
        >
          <Link
            to={`/recipes/${recipe.id}`}
            role="menuitem"
            className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold text-text-700 transition hover:bg-background-100"
          >
            Edit recipe
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-primary transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRemovalPending}
            onClick={onRemove}
          >
            {isRemoving ? 'Removing...' : 'Remove from library'}
          </button>
        </div>
      )}
      <Link
        to={`/recipes/${recipe.id}`}
        className="block transition hover:bg-background-100"
      >
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="flex h-32 items-center justify-center bg-secondary-100 text-secondary-800">
            <LuNotebookPen className="h-8 w-8" />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-bold text-text-950">{recipe.title}</h3>
          {recipe.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-600">
              {recipe.description}
            </p>
          )}
          {totalTime > 0 && (
            <p className="mt-3 text-sm text-text-600">{totalTime} min</p>
          )}
        </div>
      </Link>
    </article>
  );
}
