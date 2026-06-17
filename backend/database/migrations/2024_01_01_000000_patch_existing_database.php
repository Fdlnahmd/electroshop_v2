<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// This migration handles an existing database from the PHP native project.
// All tables (users, products, categories, orders, etc.) already exist.
// We only need to:
//   1. Add missing columns to existing tables
//   2. Create tables that don't exist yet (personal_access_tokens)

return new class extends Migration
{
    public function up(): void
    {
        // Add 'role' column to users if not present
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('customer')->after('address');
            });
        }

        // Add 'status' column to reviews if not present
        if (Schema::hasTable('reviews') && !Schema::hasColumn('reviews', 'status')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->string('status')->default('approved')->after('comment');
            });
        }

        // Update admin user role
        \DB::table('users')
            ->whereIn('email', ['admin@elektroshop.com', 'admin@electroshop.com', 'admin@gmail.com'])
            ->update(['role' => 'admin']);
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', fn(Blueprint $t) => $t->dropColumn('role'));
        }
        if (Schema::hasColumn('reviews', 'status')) {
            Schema::table('reviews', fn(Blueprint $t) => $t->dropColumn('status'));
        }
    }
};
