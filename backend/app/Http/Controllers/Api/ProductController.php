<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')
            ->where('status', 'active');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        $products = $query->orderBy('created_at', 'desc')->get();

        return response()->json($products->map(fn($p) => $this->formatProduct($p)));
    }

    public function categories()
    {
        $cats = Category::orderBy('name')->pluck('name');
        return response()->json(array_merge(['All'], $cats->toArray()));
    }

    public function show($id)
    {
        $product = Product::with(['category', 'reviews.user'])
            ->where('status', 'active')
            ->findOrFail($id);

        return response()->json($this->formatProduct($product, true));
    }

    public function formatProduct(Product $p, bool $withReviews = false): array
    {
        $img = $p->image ?? '';
        if (!empty($img) && !str_starts_with($img, 'http')) {
            $img = '/' . ltrim($img, '/');
        }

        $avgRating = round($p->reviews()->avg('rating') ?? 0, 1);
        $reviewCount = $p->reviews()->count();

        $data = [
            'id'           => (string) $p->id,
            'name'         => $p->name,
            'description'  => $p->description ?? '',
            'price'        => (float) $p->price,
            'category'     => $p->category ? $p->category->name : 'Uncategorized',
            'category_id'  => $p->category_id,
            'image'        => $img,
            'stock'        => (int) $p->stock,
            'status'       => $p->status,
            'rating'       => (float) $avgRating,
            'reviewsCount' => $reviewCount,
            'specs'        => [],
        ];

        if ($withReviews) {
            $data['reviews'] = $p->reviews()->with('user')->get()->map(fn($r) => [
                'id'      => (string) $r->id,
                'author'  => $r->user->name ?? 'Anonim',
                'avatar'  => 'https://ui-avatars.com/api/?name=' . urlencode($r->user->name ?? 'U') . '&background=1A1A2E&color=fff',
                'rating'  => (int) $r->rating,
                'comment' => $r->comment,
                'date'    => $r->created_at,
            ])->toArray();
        }

        return $data;
    }
}
