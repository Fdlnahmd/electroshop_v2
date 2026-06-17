<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Bersihkan data lama agar produk & kategori tidak bercampur
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('order_status_history')->truncate();
        DB::table('order_items')->truncate();
        DB::table('orders')->truncate();
        DB::table('reviews')->truncate();
        DB::table('cart')->truncate();
        DB::table('products')->truncate();
        DB::table('categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ── 1. Tambah kategori gadget konsumer ──────────────────────────────
        $categoryData = [
            ['name' => 'Smartphones',  'slug' => 'smartphones',  'description' => 'Smartphone dan handphone terbaru'],
            ['name' => 'Laptops',      'slug' => 'laptops',      'description' => 'Laptop dan notebook untuk profesional & kreator'],
            ['name' => 'Audio',        'slug' => 'audio',        'description' => 'Headphone, earbuds, dan speaker premium'],
            ['name' => 'Accessories',  'slug' => 'accessories',  'description' => 'Aksesori dan peripheral elektronik'],
        ];

        foreach ($categoryData as $cat) {
            DB::table('categories')->insertOrIgnore($cat);
        }

        // Ambil ID kategori
        $catIds = DB::table('categories')->whereIn('slug', ['smartphones', 'laptops', 'audio', 'accessories'])
            ->pluck('id', 'slug');

        // ── 2. Tambah produk dengan gambar Unsplash yang aktif ───────────────
        $products = [
            // ── Laptops ────────────────────────────────────────────────────
            [
                'name'        => 'ZenBook Ultra 14"',
                'description' => 'Laptop ultra-slim dengan layar OLED 14,2 inci memukau, 16GB RAM LPDDR5, SSD NVMe 512GB, dan prosesor octa-core bertenaga. Bobot hanya 1,2 kg. Ideal untuk profesional dan kreator.',
                'price'       => 17999000.00,
                'stock'       => 12,
                'category_id' => $catIds['laptops'],
                'image'       => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'ProBook 16 Creator',
                'description' => 'Laptop kreator dengan layar IPS 16 inci 165Hz, GPU dedikasi RTX 4060, 32GB RAM DDR5, dan keyboard dengan lampu backlit RGB. Untuk editing video, 3D render, dan gaming.',
                'price'       => 22500000.00,
                'stock'       => 8,
                'category_id' => $catIds['laptops'],
                'image'       => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'AirSlim 13" Essential',
                'description' => 'Laptop tipis ringan untuk produktivitas harian. Layar FHD 13,3 inci, prosesor hemat daya, baterai tahan 12 jam, dan desain all-day portability.',
                'price'       => 9499000.00,
                'stock'       => 30,
                'category_id' => $catIds['laptops'],
                'image'       => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
                'status'      => 'active',
            ],

            // ── Accessories ────────────────────────────────────────────────
            [
                'name'        => 'Minimalist Desk Mat',
                'description' => 'Desk mat premium dari bahan vegan leather. Permukaan halus untuk tracking mouse optimal, tepi jahitan rapi, dan alas anti-slip. Ukuran 80×40 cm, warna matte black.',
                'price'       => 349000.00,
                'stock'       => 200,
                'category_id' => $catIds['accessories'],
                'image'       => 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'Thunderbolt 4 Dock 11-in-1',
                'description' => 'Hub Thunderbolt 4 dengan 11 port: 3x TB4, 4x USB-A 3.2, SD/microSD, Ethernet, audio 3.5mm, dan power delivery 96W. Dukung dual monitor 4K@60Hz.',
                'price'       => 2799000.00,
                'stock'       => 35,
                'category_id' => $catIds['accessories'],
                'image'       => 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'MechKey 75% Wireless Keyboard',
                'description' => 'Keyboard mekanikal 75% dengan switch Red linear, hot-swap PCB, koneksi tri-mode (Bluetooth 5.0 / 2.4GHz / USB-C), dan baterai 4000mAh. Backlit RGB per tombol.',
                'price'       => 1250000.00,
                'stock'       => 60,
                'category_id' => $catIds['accessories'],
                'image'       => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'UltraGlide Pro Mouse',
                'description' => 'Mouse gaming wireless 26000 DPI dengan sensor optik presisi tinggi, polling rate 1000Hz, baterai 70 jam, dan desain ergonomis ringan 68 gram.',
                'price'       => 899000.00,
                'stock'       => 90,
                'category_id' => $catIds['accessories'],
                'image'       => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
                'status'      => 'active',
            ],

            // ── Audio ───────────────────────────────────────────────────────
            [
                'name'        => 'X-Pro Noise Cancelling Headphones',
                'description' => 'Headphone over-ear dengan noise cancellation terdepan di industri, Bluetooth 5.2, dan baterai hingga 30 jam. Suara jernih di lingkungan bising sekalipun.',
                'price'       => 3499000.00,
                'stock'       => 45,
                'category_id' => $catIds['audio'],
                'image'       => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'Aero Wireless Earbuds',
                'description' => 'Earbuds TWS kompak dengan ANC aktif dan mode transparansi. Baterai earbuds 8 jam + charging case total 24 jam. Tahan keringat IPX4.',
                'price'       => 1799000.00,
                'stock'       => 80,
                'category_id' => $catIds['audio'],
                'image'       => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'SoundBlast Studio Monitor',
                'description' => 'Speaker studio monitor 2.0 ch dengan driver 5 inci kustom, respons frekuensi 50Hz–20kHz, dan koneksi Bluetooth 5.0 + aux. Suara flat & akurat untuk mixing musik.',
                'price'       => 2150000.00,
                'stock'       => 25,
                'category_id' => $catIds['audio'],
                'image'       => 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
                'status'      => 'active',
            ],

            // ── Smartphones ──────────────────────────────────────────────
            [
                'name'        => 'Quantum Phone Pro',
                'description' => 'Smartphone flagship dengan layar OLED 120Hz LTPO 6,7 inci, kamera triple 50MP, baterai 4500mAh tahan seharian. Dilengkapi prosesor terbaru dan konektivitas 5G.',
                'price'       => 8999000.00,
                'stock'       => 124,
                'category_id' => $catIds['smartphones'],
                'image'       => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'Nova S Ultra',
                'description' => 'Desain tipis premium dengan kamera satelit 200MP, layar Dynamic AMOLED 2X, dan pengisian cepat 65W. Cocok untuk fotografer dan konten kreator.',
                'price'       => 12499000.00,
                'stock'       => 55,
                'category_id' => $catIds['smartphones'],
                'image'       => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
                'status'      => 'active',
            ],
            [
                'name'        => 'Vivo X90 Lite',
                'description' => 'Pilihan mid-range terbaik dengan layar 6,4 inci AMOLED, kamera 64MP, dan baterai 5000mAh. Performa kencang dengan harga terjangkau.',
                'price'       => 4299000.00,
                'stock'       => 200,
                'category_id' => $catIds['smartphones'],
                'image'       => 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
                'status'      => 'active',
            ],
        ];

        foreach ($products as $product) {
            // Cek apakah produk sudah ada berdasarkan nama, hindari duplikat
            $exists = DB::table('products')->where('name', $product['name'])->exists();
            if (!$exists) {
                $product['created_at'] = now();
                $product['updated_at'] = now();
                DB::table('products')->insert($product);
            }
        }

        $this->command->info('✅ ProductSeeder: ' . count($products) . ' produk berhasil ditambahkan ke database.');
    }
}
