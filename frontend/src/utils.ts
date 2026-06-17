export function formatRupiah(value: number): string {
  return 'Rp ' + Math.round(value).toLocaleString('id-ID');
}

export const getProductImageUrl = (path: string | undefined | null): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return path.startsWith('/') ? path : '/' + path;
};

