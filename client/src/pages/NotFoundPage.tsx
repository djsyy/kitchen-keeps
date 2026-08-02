import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-xl">
        The page you are looking for is in another castle!
      </h1>
      <Link to="/" className="text-xl hover:scale-110">
        Home
      </Link>
    </main>
  );
}
