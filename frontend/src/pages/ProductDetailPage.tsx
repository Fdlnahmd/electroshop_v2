import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Rating } from '../components/Rating';
import { Minus, Plus, ShoppingCart, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { Product } from '../data';
import { formatRupiah, getProductImageUrl } from '../utils';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, apiUrl, user } = useAppContext();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [id, apiUrl]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <Link to="/" className="text-primary hover:underline font-medium">Return to Home</Link>
      </div>
    );
  }

  const thumbnails = product.image ? [getProductImageUrl(product.image)] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to={`/?category=${product.category}`} className="hover:text-primary">{product.category}</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
            <img 
              src={thumbnails[activeImage] || thumbnails[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-5 gap-4">
            {thumbnails.map((thumb, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  activeImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <Rating value={product.rating} count={product.reviewsCount} />
            <div className="h-4 w-px bg-gray-300"></div>
            {product.stock > 0 ? (
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">In Stock</span>
            ) : (
              <span className="text-sm font-medium text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">Out of Stock</span>
            )}
          </div>
          
          <div className="text-3xl font-bold text-gray-900 mb-6">{formatRupiah(product.price)}</div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          
          {user?.role === 'admin' ? (
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl text-center space-y-4">
              <p className="text-gray-600 text-sm font-medium">Anda masuk sebagai Admin. Mode pembelian dinonaktifkan.</p>
              <Link to="/admin" className="inline-flex items-center justify-center w-full py-3 px-6 rounded-lg font-semibold bg-[#1A1A2E] text-white hover:bg-opacity-90 transition-all text-sm shadow-sm">
                Ke Dashboard Admin
              </Link>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-sm text-gray-500">Only {product.stock} items left!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium border-2 transition-all ${
                    added 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'border-primary text-primary hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {added ? <Check size={20} /> : <ShoppingCart size={20} />}
                  {added ? 'Added to Cart' : 'Add to Cart'}
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="py-3 px-6 rounded-lg font-medium bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}
          
          {/* Guarantees */}
          <ul className="space-y-3 pl-2 text-sm text-gray-600 border-t border-gray-100 pt-6">
            <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Gratis ongkir dengan opsi Ambil Sendiri</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Jaminan uang kembali 30 hari</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Garansi resmi 1 tahun</li>
          </ul>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-gray-200">
        <div className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('desc')}
            className={`py-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'desc' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'specs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{reviews.length}</span>
          </button>
        </div>
        
        <div className="py-8 min-h-[300px]">
          {activeTab === 'desc' && (
            <div className="prose max-w-none text-gray-600">
              <p>{product.description}</p>
              <p className="mt-4">Designed with minimalism in mind, the {product.name} offers unparalleled performance tucked into an incredibly sleek form factor. Built from premium materials that endure, this is technology that complements your lifestyle rather than complicating it.</p>
            </div>
          )}
          
          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <dl className="divide-y divide-gray-100">
                {product.specs && Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex flex-col gap-1">
                    <dt className="text-sm font-medium text-gray-900">{key}</dt>
                    <dd className="text-sm text-gray-600 sm:col-span-2">{value}</dd>
                  </div>
                ))}
                {(!product.specs || Object.keys(product.specs).length === 0) && (
                  <p className="text-gray-500 italic py-4">No specifications available for this product.</p>
                )}
              </dl>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{review.author}</h4>
                        <div className="flex items-center gap-2">
                          <Rating value={review.rating} />
                          <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No reviews yet for this product.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
