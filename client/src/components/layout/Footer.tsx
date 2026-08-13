import { FaGithub } from 'react-icons/fa';
import { LuMessageSquarePlus } from 'react-icons/lu';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-background-200 bg-background-50 border-t px-4 py-4 sm:px-6">
      <div className="text-text-600 mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center text-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>© {currentYear} Kitchen Keeps</span>
          <span aria-hidden="true">·</span>
          <span>Built by Dj</span>
          <span aria-hidden="true">·</span>
          <a
            href="https://github.com/djsyy/kitchen-keeps"
            target="_blank"
            rel="noreferrer"
            className="text-text-800 hover:text-primary inline-flex items-center font-medium transition-colors"
            aria-label="Kitchen Keeps on GitHub (opens in a new tab)"
            title="Kitchen Keeps on GitHub"
          >
            <FaGithub className="h-4 w-4" aria-hidden="true" />
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://github.com/djsyy/kitchen-keeps/issues"
            target="_blank"
            rel="noreferrer"
            className="text-text-800 hover:text-primary inline-flex items-center gap-1 font-medium transition-colors"
            aria-label="Send feedback (opens in a new tab)"
          >
            <LuMessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            Feedback
          </a>
        </div>
      </div>
    </footer>
  );
}
