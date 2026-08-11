# Kitchen Keeps

Kitchen Keeps is a recipe organization and kitchen-prep application built to make it easier to keep recipes organized and figure out what is needed before cooking.

It keeps the workflow focused without turning into a full inventory-management or shopping application.

## Features

- Create recipes with metadata, ordered ingredients, preparation steps, and images.
- Organize recipes into personal libraries with custom icons or cover images.
- Keep a lightweight, presence-only Pantry of ingredients you generally have on hand.
- Discover recipes based on ingredients linked to your Pantry.
- Start a temporary recipe check-in to mark ingredients as available, uncertain, or needed before cooking.
- Generate a screenshot-friendly summary of what you need from a completed check-in.
- Create and manage private ingredients for recipes that aren't already available in the shared ingredient data.

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Query, React Router

**Backend:** Node.js, Express, PostgreSQL

**Services:** Cloudinary for image storage and Resend for password-reset emails

**Testing & CI:** Vitest, Supertest, Playwright, GitHub Actions

## Engineering Highlights

- User-owned resources are protected through authenticated ownership checks and parameterized PostgreSQL queries.
- Password-reset tokens are hashed, short-lived, and single-use, while password changes revoke existing sessions.
- Uploaded images are decoded and validated as actual JPG, PNG, or WebP content before being sent to Cloudinary, with file-size and pixel limits enforced.
- Unit, database integration, and browser workflow tests cover important application behavior.

## Planned Features

Kitchen Keeps V1 intentionally focuses on the core recipe organization and pre-cooking workflow. Additional ideas and features were deferred in order to keep the initial release small(er).

- A public landing page separate from the signed-in app.
- Recipe filtering and sorting.
- Refreshing or restarting a prep-list snapshot after its recipe changes.
- Explanations for Pantry recommendations and simple recommendation filters.
- Recipe-image crop and position controls.
- Account data export and active-session/device management.
- Offline-friendly access to an already-open recipe or prep list.
- Optional email sharing for a completed ingredient check-in.

## Feedback

Have a feature you'd like to see in Kitchen Keeps? Let me know! Feel free to
[open an issue](https://github.com/djsyy/kitchen-keeps/issues) with feature ideas, suggestions, or improvements.

## Usage

Kitchen Keeps is a personal portfolio project. The source code is publicly
available for viewing and evaluation, but permission is not granted to copy,
modify, distribute, or reuse the code.

© 2026 Dejuan Anthony Sy. All rights reserved.
