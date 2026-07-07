import Navbar from '../components/layout/Navbar';

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="grid grid-cols-[1fr_2fr] gap-4 mx-auto max-w-7xl py-8">
        <div className="rounded-lg border p-6">Left content</div>

        <div className="rounded-lg border p-6">Right content</div>
      </div>
    </main>
  );
}
