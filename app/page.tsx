import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-radial from-blue-500 to-blue-700">
      <h1 className="text-5xl font-extrabold mb-8 text-yellow-400">Trade Me Scraper</h1>
      <div className="w-full max-w-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Link
          href="/scrape/link"
          className="group rounded-lg border border-transparent bg-yellow-500 p-8 shadow-lg hover:bg-yellow-400 transition-colors duration-300"
        >
          <h2 className="text-3xl font-semibold mb-2 text-gray-900">Link Fetch</h2>
          <p className="text-lg text-gray-800">Fetch details for a specific link.</p>
        </Link>

        <Link
          href="/scrape/fetch-all"
          className="group rounded-lg border border-transparent bg-yellow-500 p-8 shadow-lg hover:bg-yellow-400 transition-colors duration-300"
        >
          <h2 className="text-3xl font-semibold mb-2 text-gray-900">Fetch All Rentals</h2>
          <p className="text-lg text-gray-800">Fetch and list all rental properties.</p>
        </Link>

        <Link
          href="/placeholder"
          className="group rounded-lg border border-transparent bg-yellow-500 p-8 shadow-lg hover:bg-yellow-400 transition-colors duration-300"
        >
          <h2 className="text-3xl font-semibold mb-2 text-gray-900">Option 3</h2>
          <p className="text-lg text-gray-800">Placeholder for future functionality.</p>
        </Link>

        <Link
          href="/placeholder"
          className="group rounded-lg border border-transparent bg-yellow-500 p-8 shadow-lg hover:bg-yellow-400 transition-colors duration-300"
        >
          <h2 className="text-3xl font-semibold mb-2 text-gray-900">Option 4</h2>
          <p className="text-lg text-gray-800">Placeholder for future functionality.</p>
        </Link>
      </div>
    </main>
  );
}
