import { LuImagePlus, LuTrash2 } from 'react-icons/lu';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import type {
  CreateLibraryPayload,
  Library,
} from '../../services/libraryService';
import ErrorMessage from '../ui/ErrorMessage';

export type LibraryCoverAction =
  | { type: 'unchanged' }
  | { type: 'upload'; file: File }
  | { type: 'remove' };

export type LibraryFormSubmission = {
  payload: CreateLibraryPayload;
  coverAction: LibraryCoverAction;
};

type LibraryFormDialogProps = {
  library?: Library;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onSubmit: (submission: LibraryFormSubmission) => void;
  onRetryCoverAction?: () => void;
  onContinueWithoutCover?: () => void;
};

export default function LibraryFormDialog({
  library,
  isPending,
  error,
  onCancel,
  onSubmit,
  onRetryCoverAction,
  onContinueWithoutCover,
}: LibraryFormDialogProps) {
  const isEditing = Boolean(library);
  const [name, setName] = useState(library?.name ?? '');
  const [description, setDescription] = useState(library?.description ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isCoverRemoved, setIsCoverRemoved] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const isAwaitingCoverRetry = Boolean(onRetryCoverAction);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [coverFile]);

  const coverSource =
    coverPreviewUrl ?? (!isCoverRemoved ? library?.cover_image_url : null);

  const handleCoverChange = (file: File | null) => {
    if (!file) {
      return;
    }

    const isSupportedType = ['image/jpeg', 'image/png', 'image/webp'].includes(
      file.type
    );

    if (!isSupportedType) {
      setCoverError('Choose a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCoverError('Choose an image that is 5 MB or smaller');
      return;
    }

    setCoverError(null);
    setCoverFile(file);
    setIsCoverRemoved(false);
  };

  const getCoverAction = (): LibraryCoverAction => {
    if (coverFile) {
      return { type: 'upload', file: coverFile };
    }

    if (isCoverRemoved) {
      return { type: 'remove' };
    }

    return { type: 'unchanged' };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onRetryCoverAction) {
      onRetryCoverAction();
      return;
    }

    onSubmit({
      payload: {
        name: name.trim(),
        description: description.trim() || null,
      },
      coverAction: getCoverAction(),
    });
  };

  return (
    <div
      className="bg-text-950/50 fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onCancel();
        }
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-form-title"
        aria-describedby="library-form-description"
        className="border-background-300 bg-background-50 flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-3xl border p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1
            id="library-form-title"
            className="text-text-950 text-xl font-bold"
          >
            {isEditing ? 'Edit library' : 'Create a library'}
          </h1>
          <p
            id="library-form-description"
            className="text-text-600 mt-1 text-sm"
          >
            {isEditing
              ? 'Update this collection’s details and cover.'
              : 'Group recipes by meal type, occasion, or any collection you use.'}
          </p>
        </div>
        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Name
          <input
            className="border-background-300 bg-background-50 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border px-3 py-2 outline-none focus:ring"
            maxLength={100}
            required
            value={name}
            disabled={isAwaitingCoverRetry}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-text-800 text-sm font-bold">
              Library cover{' '}
              <span className="text-text-500 font-normal">(optional)</span>
            </p>
            <span className="text-text-500 text-xs">
              JPG, PNG, or WebP · 5 MB max
            </span>
          </div>
          <div className="relative">
            <button
              type="button"
              aria-label={
                coverSource ? 'Change library cover' : 'Choose library cover'
              }
              className="border-background-300 focus-visible:outline-primary group relative block w-full overflow-hidden rounded-lg border text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
              disabled={isAwaitingCoverRetry}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverSource ? (
                <img
                  src={coverSource}
                  alt="Library cover preview"
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="bg-background-100 text-text-500 hover:bg-background-100/50 flex h-44 flex-col items-center justify-center gap-2 text-sm hover:cursor-pointer">
                  <LuImagePlus className="h-8 w-8" aria-hidden="true" />
                </div>
              )}
              <span className="bg-text-950/55 text-text-50 pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <LuImagePlus className="h-5 w-5" />
                {coverSource ? 'Change cover' : 'Choose cover'}
              </span>
            </button>
            {coverSource && (
              <button
                type="button"
                aria-label="Remove library cover"
                className="text-text-50 focus-visible:outline-text-50 absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-lg drop-shadow-md transition hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-2"
                disabled={isAwaitingCoverRetry}
                onClick={(event) => {
                  event.stopPropagation();
                  setCoverFile(null);
                  setCoverError(null);
                  setIsCoverRemoved(Boolean(library?.cover_image_url));
                }}
              >
                <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isAwaitingCoverRetry}
            onChange={(event) => {
              handleCoverChange(event.currentTarget.files?.[0] ?? null);
              event.currentTarget.value = '';
            }}
          />
        </div>
        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Description{' '}
          <span className="text-text-500 font-normal">(optional)</span>
          <textarea
            className="border-background-300 bg-background-50 text-text-950 focus:border-primary focus:ring-primary-100 min-h-24 rounded-lg border px-3 py-2 outline-none focus:ring"
            maxLength={1000}
            value={description}
            disabled={isAwaitingCoverRetry}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </label>
        {(error || coverError) && (
          <ErrorMessage message={error?.message ?? coverError ?? ''} />
        )}
        <div className="flex justify-end gap-3">
          {isAwaitingCoverRetry && onContinueWithoutCover && (
            <button
              type="button"
              className="text-text-700 hover:bg-background-100 rounded-lg px-4 py-2.5 text-sm font-bold transition"
              disabled={isPending}
              onClick={onContinueWithoutCover}
            >
              {library?.cover_image_url
                ? 'Keep current cover'
                : 'Continue without cover'}
            </button>
          )}
          <button
            type="button"
            className="text-text-700 hover:bg-background-100 rounded-lg px-4 py-2.5 text-sm font-bold transition"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-text-50 hover:bg-primary-700 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !name.trim() || Boolean(coverError)}
          >
            {isPending
              ? isAwaitingCoverRetry
                ? 'Retrying cover...'
                : isEditing
                  ? 'Saving...'
                  : 'Creating...'
              : isAwaitingCoverRetry
                ? 'Retry cover upload'
                : isEditing
                  ? 'Save changes'
                  : 'Create library'}
          </button>
        </div>
      </form>
    </div>
  );
}
