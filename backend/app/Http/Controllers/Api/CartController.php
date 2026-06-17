<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = Cart::with('product.category')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($items->map(function ($item) {
            $p   = $item->product;
            $img = $p->image ?? '';
            if (!empty($img) && !str_starts_with($img, 'http')) {
                $img = '/' . ltrim($img, '/');
            }
            return [
                'product' => [
                    'id'           => (string) $p->id,
                    'name'         => $p->name,
                    'description'  => $p->description ?? '',
                    'price'        => (float) $p->price,
                    'category'     => $p->category ? $p->category->name : '',
                    'image'        => $img,
                    'stock'        => (int) $p->stock,
                    'rating'       => 0,
                    'reviewsCount' => 0,
                    'specs'        => [],
                ],
                'quantity' => (int) $item->quantity,
            ];
        }));
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'nullable|integer|min:1',
        ]);

        $userId    = $request->user()->id;
        $productId = $request->product_id;
        $qty       = $request->input('quantity', 1);

        $product = Product::findOrFail($productId);
        $item    = Cart::where('user_id', $userId)->where('product_id', $productId)->first();

        if ($item) {
            $newQty = $item->quantity + $qty;
            if ($product->stock < $newQty) {
                return response()->json(['message' => 'Stok tidak mencukupi'], 400);
            }
            $item->update(['quantity' => $newQty]);
        } else {
            if ($product->stock < $qty) {
                return response()->json(['message' => 'Stok tidak mencukupi'], 400);
            }
            Cart::create(['user_id' => $userId, 'product_id' => $productId, 'quantity' => $qty]);
        }

        return response()->json(['message' => 'Produk ditambahkan ke keranjang']);
    }

    public function update(Request $request, $productId)
    {
        $request->validate(['quantity' => 'required|integer|min:0']);

        $userId = $request->user()->id;
        $item   = Cart::where('user_id', $userId)->where('product_id', $productId)->first();

        if (!$item) return response()->json(['message' => 'Item tidak ditemukan'], 404);

        if ($request->quantity == 0) {
            $item->delete();
            return response()->json(['message' => 'Item dihapus dari keranjang']);
        }

        $product = Product::findOrFail($productId);
        if ($product->stock < $request->quantity) {
            return response()->json(['message' => 'Stok tidak mencukupi'], 400);
        }

        $item->update(['quantity' => $request->quantity]);
        return response()->json(['message' => 'Keranjang diperbarui']);
    }

    public function destroy(Request $request, $productId)
    {
        Cart::where('user_id', $request->user()->id)->where('product_id', $productId)->delete();
        return response()->json(['message' => 'Item dihapus dari keranjang']);
    }

    public function clear(Request $request)
    {
        Cart::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Keranjang dikosongkan']);
    }
}
