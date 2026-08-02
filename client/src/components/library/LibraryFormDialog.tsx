import { type FormEvent, useState } from 'react';
import {
  libraryColorClasses,
  libraryColorOptions,
  libraryIconOptions,
  libraryIcons,
  type LibraryColorKey,
  type LibraryIconKey,
} from '../../config/libraryIcons';
import type {
  CreateLibraryPayload,
  Library,
} from '../../services/libraryService';
import ErrorMessage from '../ui/ErrorMessage';

type LibraryFormDialogProps = {
  library?: Library;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onSubmit: (payload: CreateLibraryPayload) => void;
};

export default function LibraryFormDialog({
  library,
  isPending,
  error,
  onCancel,
  onSubmit,
}: LibraryFormDialogProps) {
  const isEditing = Boolean(library);
  const [name, setName] = useState(library?.name ?? '');
  const [description, setDescription] = useState(library?.description ?? '');
  const [iconKey, setIconKey] = useState<LibraryIconKey>(
    library?.icon_key ?? 'folder'
  );
  const [colorKey, setColorKey] = useState<LibraryColorKey>(
    library?.color_key ?? 'primary'
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      icon_key: iconKey,
      color_key: colorKey,
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
              ? 'Update this collection’s details and appearance.'
              : 'Group recipes by meal type, occasion, or any collection you use.'}
          </p>
        </div>
        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Name
          <input
            className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
            maxLength={100}
            required
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <fieldset>
          <legend className="text-text-800 text-sm font-bold">Icon</legend>
          <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {libraryIconOptions.map((option) => {
              const Icon = libraryIcons[option.key];
              const isSelected = option.key === iconKey;

              return (
                <button
                  key={option.key}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={isSelected}
                  className={`border-background-300 bg-background-50 text-text-700 flex h-10 items-center justify-center rounded-lg border transition ${
                    isSelected
                      ? 'border-primary bg-primary-50 text-primary border-2 shadow-sm'
                      : 'hover:bg-background-100'
                  }`}
                  onClick={() => setIconKey(option.key)}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-text-800 text-sm font-bold">
            Card color
          </legend>
          <div className="mt-2 flex gap-2">
            {libraryColorOptions.map((option) => {
              const isSelected = option.key === colorKey;

              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={isSelected}
                  className={`h-9 rounded-full border px-4 text-sm transition ${libraryColorClasses[option.key]} ${
                    isSelected
                      ? 'border-2 font-bold shadow-sm'
                      : 'font-normal hover:brightness-95'
                  }`}
                  onClick={() => setColorKey(option.key)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Description{' '}
          <span className="text-text-500 font-normal">(optional)</span>
          <textarea
            className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 min-h-24 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </label>
        {error && <ErrorMessage message={error.message} />}
        <div className="flex justify-end gap-3">
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
            disabled={isPending || !name.trim()}
          >
            {isPending
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save changes'
                : 'Create library'}
          </button>
        </div>
      </form>
    </div>
  );
}
