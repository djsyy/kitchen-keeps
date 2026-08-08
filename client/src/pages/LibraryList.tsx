import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LuFolderPlus } from 'react-icons/lu';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LibraryDeleteDialog from '../components/library/LibraryDeleteDialog';
import LibraryFormDialog, {
  type LibraryCoverAction,
  type LibraryFormSubmission,
} from '../components/library/LibraryFormDialog';
import LibraryGrid from '../components/library/LibraryGrid';
import Navbar from '../components/layout/Navbar';
import EmptyPage from '../components/ui/EmptyPage';
import { LibraryListSkeleton } from '../components/ui/LoadingSkeletons';
import {
  type Library,
  createLibrary,
  deleteLibrary,
  getLibraries,
  removeLibraryCover,
  updateLibrary,
  uploadLibraryCover,
} from '../services/libraryService';
import { queryKeys } from '../utils/queryKeys';

type PendingCoverAction = {
  libraryId: number;
  coverAction: Exclude<LibraryCoverAction, { type: 'unchanged' }>;
  form: 'create' | 'edit';
  error: Error;
};

class LibraryCoverActionError extends Error {
  pendingCoverAction: PendingCoverAction;

  constructor(
    pendingCoverAction: Omit<PendingCoverAction, 'error'>,
    cause: unknown
  ) {
    const error =
      cause instanceof Error
        ? cause
        : new Error('Unable to update library cover');

    super(error.message);
    this.name = 'LibraryCoverActionError';
    this.pendingCoverAction = { ...pendingCoverAction, error };
  }
}

const runLibraryCoverAction = async (
  libraryId: number,
  coverAction: LibraryCoverAction
) => {
  if (coverAction.type === 'upload') {
    await uploadLibraryCover(libraryId, coverAction.file);
  }

  if (coverAction.type === 'remove') {
    await removeLibraryCover(libraryId);
  }
};

function LibraryError() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="text-text-600">
        We couldn’t load your libraries. Please try again.
      </p>
    </section>
  );
}

export default function LibraryList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState<Library | null>(null);
  const [deletingLibrary, setDeletingLibrary] = useState<Library | null>(null);
  const [pendingCoverAction, setPendingCoverAction] =
    useState<PendingCoverAction | null>(null);
  const { data, isError, isPending } = useQuery({
    queryKey: queryKeys.libraries.all,
    queryFn: getLibraries,
  });

  const libraries = data?.data.libraries ?? [];

  useEffect(() => {
    if (searchParams.get('create') !== '1') {
      return;
    }

    setIsCreateFormOpen(true);
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('create');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const invalidateLibraryViews = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.libraries.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
    ]);
  };

  const createLibraryMutation = useMutation({
    mutationFn: async ({ payload, coverAction }: LibraryFormSubmission) => {
      const response = await createLibrary(payload);
      const library = response.data.library;

      try {
        await runLibraryCoverAction(library.id, coverAction);
      } catch (error) {
        if (coverAction.type !== 'unchanged') {
          throw new LibraryCoverActionError(
            { libraryId: library.id, coverAction, form: 'create' },
            error
          );
        }

        throw error;
      }
    },
    onSuccess: async () => {
      await invalidateLibraryViews();
      setIsCreateFormOpen(false);
      setPendingCoverAction(null);
    },
    onError: (error) => {
      if (error instanceof LibraryCoverActionError) {
        setPendingCoverAction(error.pendingCoverAction);
      }
    },
  });

  const updateLibraryMutation = useMutation({
    mutationFn: ({
      libraryId,
      submission,
    }: {
      libraryId: number;
      submission: LibraryFormSubmission;
    }) =>
      (async () => {
        await updateLibrary(libraryId, submission.payload);

        try {
          await runLibraryCoverAction(libraryId, submission.coverAction);
        } catch (error) {
          if (submission.coverAction.type !== 'unchanged') {
            throw new LibraryCoverActionError(
              { libraryId, coverAction: submission.coverAction, form: 'edit' },
              error
            );
          }

          throw error;
        }
      })(),
    onSuccess: async () => {
      await invalidateLibraryViews();
      setEditingLibrary(null);
      setPendingCoverAction(null);
    },
    onError: (error) => {
      if (error instanceof LibraryCoverActionError) {
        setPendingCoverAction(error.pendingCoverAction);
      }
    },
  });

  const retryCoverActionMutation = useMutation({
    mutationFn: ({ libraryId, coverAction }: PendingCoverAction) =>
      runLibraryCoverAction(libraryId, coverAction),
  });

  const deleteLibraryMutation = useMutation({
    mutationFn: deleteLibrary,
    onSuccess: async () => {
      await invalidateLibraryViews();
      setDeletingLibrary(null);
    },
  });

  const retryPendingCoverAction = () => {
    if (!pendingCoverAction) {
      return;
    }

    retryCoverActionMutation.mutate(pendingCoverAction, {
      onSuccess: async () => {
        await invalidateLibraryViews();

        if (pendingCoverAction.form === 'create') {
          setIsCreateFormOpen(false);
        } else {
          setEditingLibrary(null);
        }

        setPendingCoverAction(null);
      },
    });
  };

  const continueWithoutCover = async () => {
    if (!pendingCoverAction) {
      return;
    }

    if (pendingCoverAction.form === 'create') {
      setIsCreateFormOpen(false);
    } else {
      setEditingLibrary(null);
    }

    setPendingCoverAction(null);
    await invalidateLibraryViews();
  };

  const getFormError = (
    form: PendingCoverAction['form'],
    error: Error | null
  ) =>
    pendingCoverAction?.form === form
      ? (retryCoverActionMutation.error ?? pendingCoverAction.error)
      : error;

  if (isPending) {
    return <LibraryListSkeleton />;
  }

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      {isCreateFormOpen && (
        <LibraryFormDialog
          error={getFormError('create', createLibraryMutation.error)}
          isPending={
            createLibraryMutation.isPending ||
            retryCoverActionMutation.isPending
          }
          onCancel={() => {
            setPendingCoverAction(null);
            setIsCreateFormOpen(false);
          }}
          onSubmit={(submission) => createLibraryMutation.mutate(submission)}
          onRetryCoverAction={
            pendingCoverAction?.form === 'create'
              ? retryPendingCoverAction
              : undefined
          }
          onContinueWithoutCover={
            pendingCoverAction?.form === 'create'
              ? continueWithoutCover
              : undefined
          }
        />
      )}
      {editingLibrary && (
        <LibraryFormDialog
          key={editingLibrary.id}
          library={editingLibrary}
          error={getFormError('edit', updateLibraryMutation.error)}
          isPending={
            updateLibraryMutation.isPending ||
            retryCoverActionMutation.isPending
          }
          onCancel={() => {
            setPendingCoverAction(null);
            setEditingLibrary(null);
          }}
          onSubmit={(submission) =>
            updateLibraryMutation.mutate({
              libraryId: editingLibrary.id,
              submission,
            })
          }
          onRetryCoverAction={
            pendingCoverAction?.form === 'edit'
              ? retryPendingCoverAction
              : undefined
          }
          onContinueWithoutCover={
            pendingCoverAction?.form === 'edit'
              ? continueWithoutCover
              : undefined
          }
        />
      )}
      {deletingLibrary && (
        <LibraryDeleteDialog
          library={deletingLibrary}
          error={deleteLibraryMutation.error}
          isPending={deleteLibraryMutation.isPending}
          onCancel={() => setDeletingLibrary(null)}
          onConfirm={() => deleteLibraryMutation.mutate(deletingLibrary.id)}
        />
      )}
      {isError ? (
        <LibraryError />
      ) : libraries.length === 0 ? (
        <EmptyPage
          icon={LuFolderPlus}
          title="No libraries yet"
          description="Create a library to group recipes by meal type, occasion, or anything else that helps you find them later."
          action={{
            label: 'Create a library',
            onClick: () => setIsCreateFormOpen(true),
          }}
        />
      ) : (
        <LibraryGrid
          libraries={libraries}
          onCreate={() => setIsCreateFormOpen(true)}
          onOpen={(library) => navigate(`/library/${library.id}`)}
          onEdit={setEditingLibrary}
          onDelete={setDeletingLibrary}
        />
      )}
    </main>
  );
}
