import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FCFBFA] font-sans antialiased">
      <div className="text-center max-w-[400px] w-full">
        {/* Clean, shadow-lifted card matching screenshot */}
        <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-10 mb-8 border border-stone-100 transition-transform hover:-translate-y-1 duration-500 relative overflow-hidden group">

          {/* Subtle decorative background blur 
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 opacity-80" /> */}

          {/* Minimalist Dashed Square Icon matching screenshot closely */}
          <div className="flex justify-center mb-8 relative z-10">
            <div className="w-[52px] h-[52px] border-[3.5px] border-dashed border-stone-800 rounded-lg flex items-center justify-center relative bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <div className="w-[22px] h-[22px] border-[2px] rounded-sm border-stone-300 absolute" />
            </div>
          </div>

          {/* Precise Typography */}
          <h2 className="text-[24px] font-bold text-stone-900 mb-3 tracking-tight">Scan to Order</h2>
          <p className="text-[#6B7280] font-medium leading-relaxed text-[16px] mb-8 font-serif px-2">
            Scan the QR code on your table to browse the menu and place your order directly from your phone.
          </p>

          {/* Elegant Button */}
          <Link
            href="/scan"
            className="inline-block w-full py-[15px] px-6 bg-stone-900 text-white rounded-[14px] font-bold hover:bg-stone-800 hover:shadow-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-900 active:scale-[0.98] tracking-wide text-[15px]"
          >
            Simulate Scan
          </Link>
        </div>

        {/* Minimalist Bottom Links */}
        <div className="flex justify-center gap-5 text-[14px] font-semibold text-stone-400">
          <Link
            href="/admin/login"
            className="px-2 py-1 rounded hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            Admin
          </Link>
          <span className="opacity-20 flex items-center text-[10px]">●</span>
          <Link
            href="/kitchen/login"
            className="px-2 py-1 rounded hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            Kitchen Staff
          </Link>
        </div>
      </div>
    </main>
  );
}
