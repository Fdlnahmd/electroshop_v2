<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $u = $request->user();
        return response()->json([
            'id'      => (string) $u->id,
            'name'    => $u->name,
            'email'   => $u->email,
            'phone'   => $u->phone ?? '',
            'address' => $u->address ?? '',
            'role'    => $u->isAdmin() ? 'admin' : 'customer',
        ]);
    }

    public function update(Request $request)
    {
        $u = $request->user();
        $request->validate([
            'name'         => 'sometimes|string|max:100',
            'phone'        => 'sometimes|nullable|string|max:20',
            'address'      => 'sometimes|nullable|string',
            'password'     => 'sometimes|nullable|string|min:6',
            'old_password' => 'required_with:password|string',
        ]);

        if ($request->filled('password')) {
            if (!Hash::check($request->old_password, $u->password)) {
                return response()->json(['message' => 'Password lama salah'], 422);
            }
            $u->password = Hash::make($request->password);
        }

        $u->fill($request->only(['name', 'phone', 'address']));
        $u->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user'    => [
                'id'      => (string) $u->id,
                'name'    => $u->name,
                'email'   => $u->email,
                'phone'   => $u->phone ?? '',
                'address' => $u->address ?? '',
                'role'    => $u->isAdmin() ? 'admin' : 'customer',
            ],
        ]);
    }

    public function stats(Request $request)
    {
        $u = $request->user();
        
        $memberSince = $u->created_at ? $u->created_at->format('Y-m-d') : null;

        $ordersQuery = Order::where('user_id', $u->id);

        $totalOrders = (clone $ordersQuery)->count();
        $completedOrders = (clone $ordersQuery)->where('status', 'delivered')->count();
        $activeOrders = (clone $ordersQuery)->whereNotIn('status', ['delivered', 'cancelled'])->count();
        $totalSpent = (float) (clone $ordersQuery)->where('status', 'delivered')->sum('total_amount');

        $recentOrders = (clone $ordersQuery)
            ->with(['items.product'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $formattedOrders = $recentOrders->map(function ($o) {
            return [
                'id'              => (string) $o->id,
                'order_number'    => $o->order_number,
                'created_at'      => $o->created_at,
                'total_amount'    => (float) $o->total_amount,
                'status'          => $this->mapStatus($o->status),
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
        });

        return response()->json([
            'member_since'     => $memberSince,
            'total_orders'     => $totalOrders,
            'completed_orders' => $completedOrders,
            'active_orders'    => $activeOrders,
            'total_spent'      => $totalSpent,
            'recent_orders'    => $formattedOrders,
        ]);
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
