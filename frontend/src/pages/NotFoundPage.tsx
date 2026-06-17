import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <FileQuestion size={44} />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-hover transition-all text-sm shadow-md"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
