<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Tambah kategori komponen elektronik ──────────────────────────
        $categoryData = [
            ['name' => 'Resistor',  'slug' => 'resistor',  'description' => 'Komponen resistor berbagai nilai hambatan'],
            ['name' => 'Kapasitor', 'slug' => 'capacitor', 'description' => 'Kapasitor elektrolit dan keramik'],
            ['name' => 'IC',        'slug' => 'ic',        'description' => 'Integrated Circuit dan mikrokontroler IC'],
            ['name' => 'Sensor',    'slug' => 'sensor',    'description' => 'Sensor suhu, kelembaban, cahaya, dll.'],
            ['name' => 'Arduino',   'slug' => 'arduino',   'description' => 'Board mikrokontroler Arduino dan shield'],
            ['name' => 'LED',       'slug' => 'led',       'description' => 'Lampu LED indikator berbagai warna'],
        ];

        foreach ($categoryData as $cat) {
            DB::table('categories')->insertOrIgnore($cat);
        }

        // Ambil ID kategori
        $catIds = DB::table('categories')->whereIn('slug', ['resistor', 'capacitor', 'ic', 'sensor', 'arduino', 'led'])
            ->pluck('id', 'slug');

        // ── 2. Tambah produk komponen ───────────────────────────────────────
        $products = [
            [
                'name'        => 'Resistor 1K Ohm',
                'description' => 'Resistor film karbon 1/4 watt dengan toleransi 5%, nilai hambatan 1K Ohm.',
                'price'       => 500.00,
                'stock'       => 100,
                'category_id' => $catIds['resistor'],
                'image'       => 'uploads/products/resistor.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'Resistor 10K Ohm',
                'description' => 'Resistor film karbon 1/4 watt dengan toleransi 5%, nilai hambatan 10K Ohm.',
                'price'       => 500.00,
                'stock'       => 150,
                'category_id' => $catIds['resistor'],
                'image'       => 'uploads/products/resistor.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'Kapasitor 100uF',
                'description' => 'Kapasitor elektrolit (Elco) nilai 100uF dengan tegangan maksimum 25V.',
                'price'       => 2000.00,
                'stock'       => 50,
                'category_id' => $catIds['capacitor'],
                'image'       => 'uploads/products/kapasitor.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'Kapasitor 1000uF',
                'description' => 'Kapasitor elektrolit (Elco) nilai 1000uF dengan tegangan maksimum 16V.',
                'price'       => 3500.00,
                'stock'       => 30,
                'category_id' => $catIds['capacitor'],
                'image'       => 'uploads/products/kapasitor.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'IC 555 Timer',
                'description' => 'IC timer/oscillator NE555 kemasan DIP-8 untuk berbagai proyek pewaktu.',
                'price'       => 15000.00,
                'stock'       => 25,
                'category_id' => $catIds['ic'],
                'image'       => 'uploads/products/ic_chip.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'IC LM358',
                'description' => 'Operational Amplifier (Op-Amp) dual tipe LM358 kemasan DIP-8.',
                'price'       => 8000.00,
                'stock'       => 40,
                'category_id' => $catIds['ic'],
                'image'       => 'uploads/products/ic_chip.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'Sensor Suhu DHT22',
                'description' => 'Sensor pengukur suhu dan kelembaban udara digital dengan presisi tinggi.',
                'price'       => 45000.00,
                'stock'       => 15,
                'category_id' => $catIds['sensor'],
                'image'       => 'uploads/products/sensor_dht22.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'Sensor LDR',
                'description' => 'Sensor cahaya Light Dependent Resistor (fotoresistor) tipe GL5528.',
                'price'       => 5000.00,
                'stock'       => 60,
                'category_id' => $catIds['sensor'],
                'image'       => 'uploads/products/sensor_ldr.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'Arduino Uno R3',
                'description' => 'Board mikrokontroler Arduino Uno R3 menggunakan chip ATmega328P.',
                'price'       => 250000.00,
                'stock'       => 10,
                'category_id' => $catIds['arduino'],
                'image'       => 'uploads/products/arduino_uno.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'Arduino Nano',
                'description' => 'Board mikrokontroler mini Arduino Nano V3.0 dengan chip ATmega328P.',
                'price'       => 150000.00,
                'stock'       => 20,
                'category_id' => $catIds['arduino'],
                'image'       => 'uploads/products/arduino_nano.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'LED 5mm Merah',
                'description' => 'Lampu LED indikator 5mm warna merah terang (Clear red).',
                'price'       => 1000.00,
                'stock'       => 200,
                'category_id' => $catIds['led'],
                'image'       => 'uploads/products/led.png',
                'status'      => 'active',
            ],
            [
                'name'        => 'LED 5mm Biru',
                'description' => 'Lampu LED indikator 5mm warna biru terang (Clear blue).',
                'price'       => 1000.00,
                'stock'       => 180,
                'category_id' => $catIds['led'],
                'image'       => 'uploads/products/led.png',
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
