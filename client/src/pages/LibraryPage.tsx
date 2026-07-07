import DashboardHeader from '../components/dashboard/DashboardHeader';

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="flex flex-col mx-auto max-w-7xl px-4 py-8">
        {/*Search bar*/}
        <div className="flex flex-col justify-center items-center">
          <label>What are you looking for?</label>
          <input
            className="bg-white w-full"
            type="search"
            placeholder="Search..."
          />
        </div>

        {/*Filters*/}
        <div className="flex justify-between py-8 items-center">
          <div>
            <span>View</span>
          </div>
          <div>
            <button>Filter</button>
          </div>
        </div>

        {/*Grid*/}
        <div className="">
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg h-40 bg-black">Item 1</div>
            <div className="rounded-lg h-40 bg-black">Item 2</div>
            <div className="rounded-lg h-40 bg-black">Item 3</div>
            <div className="rounded-lg h-40 bg-black">Item 4</div>
            <div className="rounded-lg h-40 bg-black">Item 5</div>
          </div>
        </div>
      </div>

      {/*Pagination*/}
      <footer className="flex justify-center py-8 items-center">
        <div>
          <span>Page 1 2 .... 4</span>
        </div>
      </footer>
    </main>
  );
}
