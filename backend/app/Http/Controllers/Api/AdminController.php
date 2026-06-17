<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    // ── Products ──────────────────────────────────────────────────

    public function products()
    {
        $products = Product::with('category')
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($products->map(fn($p) => $this->formatProduct($p)));
    }

    public function categories()
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return response()->json($categories->map(fn($c) => [
            'id'   => (int) $c->id,
            'name' => $c->name,
        ]));
    }

    public function storeProduct(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image'       => 'nullable|image|max:5120',
            'image_url'   => 'nullable|string',
            'status'      => 'in:active,inactive',
        ]);

        $imagePath = $this->handleImage($request);

        $product = Product::create([
            'name'        => $request->name,
            'description' => $request->description ?? '',
            'price'       => $request->price,
            'stock'       => $request->stock,
            'category_id' => $request->category_id,
            'image'       => $imagePath,
            'status'      => $request->status ?? 'active',
        ]);

        return response()->json(['message' => 'Produk berhasil ditambahkan', 'product' => $this->formatProduct($product->load('category'))], 201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'image'       => 'nullable|image|max:5120',
            'image_url'   => 'nullable|string',
            'status'      => 'in:active,inactive',
        ]);

        $imagePath = $this->handleImage($request, $product->image ?? '');

        $product->update(array_filter([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'stock'       => $request->stock,
            'category_id' => $request->category_id,
            'image'       => $imagePath ?: ($product->image ?? ''),
            'status'      => $request->status,
        ], fn($v) => $v !== null));

        return response()->json(['message' => 'Produk berhasil diperbarui', 'product' => $this->formatProduct($product->fresh('category'))]);
    }

    public function destroyProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'inactive']);

        return response()->json(['message' => 'Produk berhasil dihapus']);
    }

    // ── Orders ────────────────────────────────────────────────────

    public function orders()
    {
        $orders = Order::with(['user', 'items.product'])->orderByDesc('created_at')->get();
        return response()->json($orders->map(fn($o) => [
            'id'           => (string) $o->id,
            'order_number' => $o->order_number,
            'user_name'    => $o->user->name ?? 'N/A',
            'user_email'   => $o->user->email ?? 'N/A',
            'date'         => $o->created_at->format('Y-m-d H:i'),
            'total'        => (float) $o->total_amount,
            'status'       => $o->status,
            'delivery'     => $o->delivery_method,
            'payment'      => $o->payment_method,
            'items_count'  => $o->items->count(),
        ]));
    }

    public function updateOrderStatus(Request $request, $orderNumber)
    {
        $request->validate(['status' => 'required|in:pending,confirmed,preparing,shipped,delivered,cancelled']);
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $order->update(['status' => $request->status]);
        return response()->json(['message' => 'Status pesanan diperbarui']);
    }

    public function destroyOrder($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $order->items()->delete();
        $order->delete();
        return response()->json(['message' => 'Pesanan berhasil dihapus']);
    }

    // ── Reviews ───────────────────────────────────────────────────

    public function reviews()
    {
        $reviews = Review::with(['user', 'product'])->orderByDesc('created_at')->get();
        return response()->json($reviews->map(fn($r) => [
            'id'           => (string) $r->id,
            'user_name'    => $r->user->name ?? 'N/A',
            'product_name' => $r->product->name ?? 'N/A',
            'product_id'   => (string) $r->product_id,
            'rating'       => (int) $r->rating,
            'comment'      => $r->comment,
            'status'       => $r->status ?? 'approved',
            'date'         => $r->created_at,
        ]));
    }

    public function moderateReview(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);
        $review = Review::findOrFail($id);
        $review->update(['status' => $request->status]);
        return response()->json(['message' => 'Status ulasan diperbarui']);
    }

    public function destroyReview($id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Ulasan berhasil dihapus']);
    }

    // ── Users ─────────────────────────────────────────────────────

    public function users()
    {
        $users = User::orderByDesc('created_at')->get();
        return response()->json($users->map(fn($u) => [
            'id'         => (string) $u->id,
            'name'       => $u->name,
            'email'      => $u->email,
            'phone'      => $u->phone ?? '',
            'role'       => $u->isAdmin() ? 'admin' : 'customer',
            'created_at' => $u->created_at?->format('Y-m-d'),
        ]));
    }

    // ── Stats ─────────────────────────────────────────────────────

    public function stats(Request $request)
    {
        $period = $request->query('period', 'all');
        $dateStart = $request->query('date_start');
        $dateEnd = $request->query('date_end');

        // Base queries
        $orderQuery = Order::query();
        $userQuery = User::query();

        // Apply filters to orderQuery and userQuery based on registration date/creation date
        if ($period === 'today') {
            $orderQuery->whereDate('created_at', today());
            $userQuery->whereDate('created_at', today());
        } elseif ($period === 'weekly') {
            $orderQuery->where('created_at', '>=', now()->subDays(7));
            $userQuery->where('created_at', '>=', now()->subDays(7));
        } elseif ($period === 'monthly') {
            $orderQuery->where('created_at', '>=', now()->subDays(30));
            $userQuery->where('created_at', '>=', now()->subDays(30));
        } elseif ($period === 'yearly') {
            $orderQuery->where('created_at', '>=', now()->subDays(365));
            $userQuery->where('created_at', '>=', now()->subDays(365));
        } elseif ($period === 'custom' && $dateStart && $dateEnd) {
            $orderQuery->whereBetween('created_at', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59']);
            $userQuery->whereBetween('created_at', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59']);
        }

        // 1. Core counters
        $totalProducts = Product::where('status', 'active')->count();
        $totalOrders = (clone $orderQuery)->count();
        $totalUsers = (clone $userQuery)->count();
        $totalRevenue = (float) (clone $orderQuery)->whereIn('status', ['confirmed','preparing','shipped','delivered'])->sum('total_amount');
        $deliveredRevenue = (float) (clone $orderQuery)->where('status', 'delivered')->sum('total_amount');
        $pendingOrders = (clone $orderQuery)->where('status', 'pending')->count();
        $completedOrdersCount = (clone $orderQuery)->where('status', 'delivered')->count();
        
        $completionRate = $totalOrders > 0 
            ? round(($completedOrdersCount / $totalOrders) * 100, 1) 
            : 0;

        // 2. Top 10 Best Selling Products
        $topProducts = \DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', \DB::raw('SUM(order_items.quantity) as total_qty'), \DB::raw('SUM(order_items.price * order_items.quantity) as total_sales'))
            ->when($period === 'today', fn($q) => $q->whereDate('orders.created_at', today()))
            ->when($period === 'weekly', fn($q) => $q->where('orders.created_at', '>=', now()->subDays(7)))
            ->when($period === 'monthly', fn($q) => $q->where('orders.created_at', '>=', now()->subDays(30)))
            ->when($period === 'yearly', fn($q) => $q->where('orders.created_at', '>=', now()->subDays(365)))
            ->when($period === 'custom' && $dateStart && $dateEnd, fn($q) => $q->whereBetween('orders.created_at', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59']))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        // 3. Payment Method Distribution
        $paymentDistribution = (clone $orderQuery)
            ->select('payment_method', \DB::raw('count(*) as count'), \DB::raw('sum(total_amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn($item) => [
                'method' => $item->payment_method,
                'count'  => $item->count,
                'total'  => (float) $item->total
            ]);

        // 4. Order Status Distribution
        $statusDistribution = (clone $orderQuery)
            ->select('status', \DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'status' => $item->status,
                'count'  => $item->count
            ]);

        // 5. Daily sales data (for trend charts)
        $salesTrend = (clone $orderQuery)
            ->select(\DB::raw('DATE(created_at) as date'), \DB::raw('sum(total_amount) as total'), \DB::raw('count(*) as count'))
            ->groupBy(\DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date'  => $item->date,
                'total' => (float) $item->total,
                'count' => $item->count
            ]);

        return response()->json([
            'total_products'        => $totalProducts,
            'total_orders'          => $totalOrders,
            'total_users'           => $totalUsers,
            'total_revenue'         => $totalRevenue,
            'delivered_revenue'     => $deliveredRevenue,
            'pending_orders'        => $pendingOrders,
            'completion_rate'       => $completionRate,
            'top_products'          => $topProducts,
            'payment_distribution'  => $paymentDistribution,
            'status_distribution'   => $statusDistribution,
            'sales_trend'           => $salesTrend,
        ]);
    }

    // ── Export CSV ────────────────────────────────────────────────

    public function export(Request $request)
    {
        $period = $request->query('period', 'all');
        $dateStart = $request->query('date_start');
        $dateEnd = $request->query('date_end');

        $query = Order::with(['user', 'items.product'])->orderByDesc('created_at');

        if ($period === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($period === 'weekly') {
            $query->where('created_at', '>=', now()->subDays(7));
        } elseif ($period === 'monthly') {
            $query->where('created_at', '>=', now()->subDays(30));
        } elseif ($period === 'yearly') {
            $query->where('created_at', '>=', now()->subDays(365));
        } elseif ($period === 'custom' && $dateStart && $dateEnd) {
            $query->whereBetween('created_at', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59']);
        }

        $orders = $query->get();

        $rows   = [];
        $rows[] = ['No Invoice','Nama Pelanggan','Email','Tanggal','Produk','Qty','Subtotal','Ongkir','Total','Pengiriman','Pembayaran','Status'];

        foreach ($orders as $o) {
            $itemStr = $o->items->map(fn($i) => ($i->product->name ?? '?') . ' x' . $i->quantity)->implode('; ');
            $subtotal = $o->total_amount - $o->delivery_fee;
            $rows[] = [
                $o->order_number,
                $o->user->name ?? '',
                $o->user->email ?? '',
                $o->created_at->format('Y-m-d H:i'),
                $itemStr,
                $o->items->sum('quantity'),
                $subtotal,
                $o->delivery_fee,
                $o->total_amount,
                $o->delivery_method,
                $o->payment_method,
                $o->status,
            ];
        }

        $csv = '';
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(fn($v) => '"' . str_replace('"', '""', $v) . '"', $row)) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="laporan_penjualan_' . date('Ymd') . '.csv"',
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private function handleImage(Request $request, string $existing = ''): string
    {
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $file     = $request->file('image');
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/products'), $filename);
            return 'uploads/products/' . $filename;
        }

        if ($request->filled('image_url')) {
            $imageUrl = $request->image_url;

            if (str_starts_with($imageUrl, 'data:image/')) {
                return $this->storeDataUrlImage($imageUrl);
            }

            return $imageUrl;
        }

        return $existing;
    }

    private function storeDataUrlImage(string $dataUrl): string
    {
        if (!preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/', $dataUrl, $matches)) {
            abort(422, 'Format gambar tidak valid');
        }

        $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
        $imageData = base64_decode($matches[2], true);

        if ($imageData === false) {
            abort(422, 'Data gambar tidak valid');
        }

        $directory = public_path('uploads/products');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $filename = uniqid() . '_' . time() . '.' . $extension;
        file_put_contents($directory . '/' . $filename, $imageData);

        return 'uploads/products/' . $filename;
    }

    private function formatProduct(Product $p): array
    {
        $img = $p->image ?? '';
        if (!empty($img) && !str_starts_with($img, 'http')) {
            $img = '/' . ltrim($img, '/');
        }
        return [
            'id'          => (string) $p->id,
            'name'        => $p->name,
            'description' => $p->description ?? '',
            'price'       => (float) $p->price,
            'stock'       => (int) $p->stock,
            'category'    => $p->category ? $p->category->name : '',
            'category_id' => $p->category_id,
            'image'       => $img,
            'status'      => $p->status,
        ];
    }
}
