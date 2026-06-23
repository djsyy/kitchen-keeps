import { PiUserCircleThin } from 'react-icons/pi';
import { LuChefHat } from 'react-icons/lu';

export default function DashboardHeader() {
  return (
    <header className="border-b border-background-200 bg-background-50/90 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-text-100 shadow-sm">
            <LuChefHat className="h-7 w-7" />
          </span>
          <div>
            <span className="block text-2xl font-bold text-text-950">
              What&apos;s Cooking?
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-base font-bold text-text-700 sm:block">
            Hi User!
          </span>
          <button
            className="rounded-lg border border-primary-100 bg-white/60 p-2 text-primary shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
            aria-label="Open profile menu"
          >
            <PiUserCircleThin className="h-8 w-8" />
          </button>
        </div>
      </div>
    </header>
  );
}
