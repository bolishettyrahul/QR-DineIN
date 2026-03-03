import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-white">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">QR-Dine</h1>
          <p className="text-gray-600 text-lg">Smart Restaurant Ordering</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-6xl mb-4" aria-hidden="true">⬚</div>
          <h2 className="text-xl font-semibold mb-2">Scan to Order</h2>
          <p className="text-gray-500">
            Scan the QR code on your table to browse the menu and place your order directly from your phone.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/admin/login"
            className="block w-full py-3 px-6 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Admin Login
          </Link>
          <Link
            href="/kitchen/login"
            className="block w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          >
            Kitchen Login
          </Link>
        </div>
      </div>
    </main>
  );
}
