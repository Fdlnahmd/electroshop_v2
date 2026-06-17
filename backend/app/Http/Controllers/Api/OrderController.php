<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    private array $deliveryFees = ['pickup' => 0, 'gojek' => 15000, 'grab' => 18000];

    public function index(Request $request)
    {
        $orders = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders->map(fn($o) => $this->formatOrder($o)));
    }

    public function show(Request $request, $orderNumber)
    {
        $order = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json($this->formatOrder($order));
    }

    public function store(Request $request)
    {
        $request->validate([
            'delivery_method' => 'required|in:pickup,gojek,grab',
            'payment_method'  => 'required|in:cod,transfer,ewallet',
            'notes'           => 'nullable|string',
            'address'         => 'nullable|string',
        ]);

        $userId    = $request->user()->id;
        $cartItems = Cart::with('product')->where('user_id', $userId)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Keranjang kosong'], 400);
        }

        $subtotal    = $cartItems->sum(fn($i) => $i->product->price * $i->quantity);
        $deliveryFee = $this->deliveryFees[$request->delivery_method] ?? 0;
        $total       = $subtotal + $deliveryFee;

        $orderNumber = 'ORD' . date('Ymd') . rand(1000, 9999);

        $order = Order::create([
            'user_id'         => $userId,
            'order_number'    => $orderNumber,
            'total_amount'    => $total,
            'delivery_method' => $request->delivery_method,
            'delivery_fee'    => $deliveryFee,
            'payment_method'  => $request->payment_method,
            'status'          => 'pending',
            'notes'           => $request->notes ?? '',
        ]);

        foreach ($cartItems as $item) {
            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $item->product_id,
                'quantity'   => $item->quantity,
                'price'      => $item->product->price,
            ]);
            // reduce stock
            Product::where('id', $item->product_id)
                ->decrement('stock', $item->quantity);
        }

        // clear cart
        Cart::where('user_id', $userId)->delete();

        return response()->json([
            'message'      => 'Pesanan berhasil dibuat!',
            'order_number' => $orderNumber,
        ], 201);
    }

    private function formatOrder(Order $o): array
    {
        return [
            'id'              => (string) $o->id,
            'order_number'    => $o->order_number,
            'date'            => $o->created_at->format('Y-m-d'),
            'status'          => $this->mapStatus($o->status),
            'raw_status'      => $o->status,
            'total'           => (float) $o->total_amount,
            'total_amount'    => (float) $o->total_amount,
            'delivery_method' => $o->delivery_method,
            'delivery_fee'    => (float) $o->delivery_fee,
            'payment_method'  => $o->payment_method,
            'notes'           => $o->notes ?? '',
            'items'           => $o->items->map(function ($item) {
                $p   = $item->product;
                $img = $p ? ($p->image ?? '') : '';
                if (!empty($img) && !str_starts_with($img, 'http')) {
                    $img = '/' . ltrim($img, '/');
                }
                return [
                    'product' => [
                        'id'    => $p ? (string) $p->id : '',
                        'name'  => $p ? $p->name : 'Produk dihapus',
                        'image' => $img,
                        'price' => (float) $item->price,
                        'category'     => '',
                        'description'  => '',
                        'stock'        => 0,
                        'rating'       => 0,
                        'reviewsCount' => 0,
                        'specs'        => [],
                    ],
                    'quantity' => (int) $item->quantity,
                ];
            })->toArray(),
        ];
    }

    private function mapStatus(string $status): string
    {
        return match ($status) {
            'pending'    => 'Pending',
            'confirmed'  => 'Processing',
            'preparing'  => 'Processing',
            'shipped'    => 'Processing',
            'delivered'  => 'Delivered',
            'cancelled'  => 'Cancelled',
            default      => ucfirst($status),
        };
    }
}
