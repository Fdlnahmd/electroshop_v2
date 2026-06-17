import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../data';
import { useAppContext } from '../AppContext';

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchParam = searchParams.get('search');
  const categoryParam = searchParams.get('category');
  const { searchTerm, setSearchTerm, apiUrl } = useAppContext();

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setSearchTerm('');
    } else if (searchParam) {
      setSearchTerm(searchParam);
      setActiveCategory('All');
    }
  }, [categoryParam, searchParam]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, [apiUrl]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const url = `${apiUrl}/api/products?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(activeCategory)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm, activeCategory, apiUrl]);
  return (
    <div className="flex flex-col min-h-screen">
      {!searchTerm && activeCategory === 'All' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
          <section className="bg-[#1A1A2E] rounded-xl relative overflow-hidden flex flex-col justify-center px-6 sm:px-12 py-12 text-white shadow-lg min-h-[220px]">
            {/* Decorative background blob */}
            <div className="absolute right-0 top-0 w-1/2 h-full bg-white/5 rotate-12 transform translate-x-12 pointer-events-none" />

            {/* Floating product images */}
            <div className="absolute right-6 sm:right-16 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center" style={{ width: '320px', height: '220px' }}>
              {/* Back product: headphones */}
              <div
                className="absolute"
                style={{
                  right: '130px',
                  top: '30px',
                  animation: 'floatSlow 5s ease-in-out infinite',
                  animationDelay: '1s',
                }}
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm" style={{ boxShadow: '0 0 30px rgba(79,172,254,0.18)' }}>
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80"
                    alt="Headphones"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Center product: laptop (main) */}
              <div
                className="absolute"
                style={{
                  right: '10px',
                  top: '-10px',
                  animation: 'floatSlow 4.5s ease-in-out infinite',
                  animationDelay: '0s',
                }}
              >
                <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/5" style={{ boxShadow: '0 0 40px rgba(79,172,254,0.3)' }}>
                  <img
                    src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
                    alt="Laptop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Front product: smartphone */}
              <div
                className="absolute"
                style={{
                  right: '20px',
                  top: '110px',
                  animation: 'floatSlow 5.5s ease-in-out infinite',
                  animationDelay: '2s',
                }}
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5" style={{ boxShadow: '0 0 25px rgba(0,242,254,0.15)' }}>
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80"
                    alt="Smartphone"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Glow circle behind products */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: '200px',
                  height: '200px',
                  right: '-20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'radial-gradient(circle, rgba(79,172,254,0.12) 0%, transparent 70%)',
                }}
              />
            </div>

            <style>{`
              @keyframes floatSlow {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-12px); }
              }
            `}</style>

            <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2 z-10 relative">Limited Time Offer</span>
            <h1 className="text-4xl font-bold leading-tight mb-4 z-10 relative">
              Minimal tech,<br />maximum potential.
            </h1>
            <p className="text-gray-300 max-w-xl mb-6 z-10 relative hidden sm:block">
              Discover a curated collection of premium electronics designed to elevate your everyday workflow.
            </p>
            <button
              onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-fit px-8 py-3 bg-white text-[#1A1A2E] font-bold rounded-lg text-sm shadow-xl z-10 relative hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </button>
          </section>
        </div>
      )}
      <main id="products" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {searchTerm && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Search results for "{searchTerm}"</h2>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-sm font-medium text-gray-500 hover:text-primary"
            >
              Clear search
            </button>
          </div>
        )}

        {!searchTerm && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="font-bold text-xl text-gray-900">Featured Products</h2>
            <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 no-scrollbar">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === category 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'bg-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse flex flex-col h-full bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-200 w-full" />
                <div className="p-4 flex flex-col flex-grow">
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="mt-auto flex justify-between items-center pt-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="w-9 h-9 bg-gray-200 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const CardComponent = ProductCard as any;
              return <CardComponent key={product.id} product={product} />;
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">We couldn't find anything matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
              }}
              className="mt-6 text-primary font-medium hover:underline"
            >
              View all products
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
