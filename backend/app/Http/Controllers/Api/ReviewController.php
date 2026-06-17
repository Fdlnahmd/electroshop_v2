<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function show($productId)
    {
        $reviews = Review::with('user')
            ->where('product_id', $productId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($reviews->map(fn($r) => [
            'id'      => (string) $r->id,
            'author'  => $r->user->name ?? 'Anonim',
            'avatar'  => 'https://ui-avatars.com/api/?name=' . urlencode($r->user->name ?? 'U') . '&background=1A1A2E&color=fff',
            'rating'  => (int) $r->rating,
            'comment' => $r->comment,
            'date'    => $r->created_at,
        ]));
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'order_id'   => 'required|exists:orders,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:1000',
        ]);

        $userId    = $request->user()->id;
        $productId = $request->product_id;
        $orderId   = $request->order_id;

        // Check user bought this product and order is delivered
        $bought = Order::where('id', $orderId)
            ->where('user_id', $userId)
            ->where('status', 'delivered')
            ->whereHas('items', fn($q) => $q->where('product_id', $productId))
            ->exists();

        if (!$bought) {
            return response()->json(['message' => 'Anda belum membeli produk ini'], 403);
        }

        // Check already reviewed this product for this order
        $existing = Review::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('order_id', $orderId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan untuk pesanan ini'], 422);
        }

        $review = Review::create([
            'user_id'    => $userId,
            'order_id'   => $orderId,
            'product_id' => $productId,
            'rating'     => $request->rating,
            'comment'    => $request->comment ?? '',
        ]);

        return response()->json(['message' => 'Ulasan berhasil dikirim', 'id' => $review->id], 201);
    }
}
