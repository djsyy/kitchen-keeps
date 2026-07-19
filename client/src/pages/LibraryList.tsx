import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import LibraryEmpty from '../components/library/LibraryEmpty';
import LibraryFormDialog from '../components/library/LibraryFormDialog';
import LibraryGrid from '../components/library/LibraryGrid';
import {
  createLibrary,
  getLibraries,
  type CreateLibraryPayload,
  type Library,
  updateLibrary,
} from '../services/libraryService';
import { useState } from 'react';

function LibraryLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="text-text-600">Loading libraries…</p>
    </section>
  );
}

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
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState<Library | null>(null);
  const { data, isError, isPending } = useQuery({
    queryKey: ['libraries'],
    queryFn: getLibraries,
  });

  const libraries = data?.data.libraries ?? [];

  const createLibraryMutation = useMutation({
    mutationFn: createLibrary,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['libraries'] });
      setIsCreateFormOpen(false);
    },
  });

  const updateLibraryMutation = useMutation({
    mutationFn: ({
      libraryId,
      payload,
    }: {
      libraryId: number;
      payload: CreateLibraryPayload;
    }) => updateLibrary(libraryId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['libraries'] });
      setEditingLibrary(null);
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      {isCreateFormOpen && (
        <LibraryFormDialog
          error={createLibraryMutation.error}
          isPending={createLibraryMutation.isPending}
          onCancel={() => setIsCreateFormOpen(false)}
          onSubmit={(payload) => createLibraryMutation.mutate(payload)}
        />
      )}
      {editingLibrary && (
        <LibraryFormDialog
          key={editingLibrary.id}
          library={editingLibrary}
          error={updateLibraryMutation.error}
          isPending={updateLibraryMutation.isPending}
          onCancel={() => setEditingLibrary(null)}
          onSubmit={(payload) =>
            updateLibraryMutation.mutate({
              libraryId: editingLibrary.id,
              payload,
            })
          }
        />
      )}
      {isPending ? (
        <LibraryLoading />
      ) : isError ? (
        <LibraryError />
      ) : libraries.length === 0 ? (
        <LibraryEmpty onCreate={() => setIsCreateFormOpen(true)} />
      ) : (
        <LibraryGrid
          libraries={libraries}
          onCreate={() => setIsCreateFormOpen(true)}
          onEdit={setEditingLibrary}
        />
      )}
    </main>
  );
}
