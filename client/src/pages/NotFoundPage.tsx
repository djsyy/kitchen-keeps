import { Link } from 'react-router-dom';
import { LuLayoutDashboard } from 'react-icons/lu';
import EmptyPlateIcon from '../components/ui/EmptyPlateIcon';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-primary text-9xl">404</h1>
      <EmptyPlateIcon className="text-brick-red-700 h-40 w-40 sm:h-52 sm:w-52" />
      <p className="text-lg">Nothing on this plate.</p>
      <p className="max-w-md text-lg">
        The page you&apos;re looking for isn&apos;t here.
      </p>
      <Link
        to="/dashboard"
        className="bg-primary text-text-100 hover:bg-primary-700 mt-5 inline-flex min-h-10 max-w-full flex-wrap items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm leading-tight font-bold shadow-sm transition"
      >
        <LuLayoutDashboard className="h-4 w-4" />
        Return to Dashboard
      </Link>
    </main>
  );
}
