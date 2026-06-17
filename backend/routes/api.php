<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

// ── Public Routes ─────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

Route::get('/products',            [ProductController::class, 'index']);
Route::get('/products/categories', [ProductController::class, 'categories']);
Route::get('/products/{id}',       [ProductController::class, 'show']);
Route::get('/reviews/{productId}', [ReviewController::class, 'show']);

// ── Authenticated Routes ───────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/profile/stats', [ProfileController::class, 'stats']);

    // Cart
    Route::get('/cart',                  [CartController::class, 'index']);
    Route::post('/cart',                 [CartController::class, 'store']);
    Route::put('/cart/{productId}',      [CartController::class, 'update']);
    Route::delete('/cart/{productId}',   [CartController::class, 'destroy']);
    Route::delete('/cart',               [CartController::class, 'clear']);

    // Orders
    Route::get('/orders',               [OrderController::class, 'index']);
    Route::post('/orders',              [OrderController::class, 'store']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);

    // ── Admin Routes ─────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Products CRUD
        Route::get('/products',         [AdminController::class, 'products']);
        Route::get('/categories',       [AdminController::class, 'categories']);
        Route::post('/products',        [AdminController::class, 'storeProduct']);
        Route::put('/products/{id}',    [AdminController::class, 'updateProduct']);
        Route::delete('/products/{id}', [AdminController::class, 'destroyProduct']);

        // Orders
        Route::get('/orders',                          [AdminController::class, 'orders']);
        Route::put('/orders/{orderNumber}/status',     [AdminController::class, 'updateOrderStatus']);
        Route::delete('/orders/{orderNumber}',         [AdminController::class, 'destroyOrder']);

        // Reviews moderation
        Route::get('/reviews',            [AdminController::class, 'reviews']);
        Route::put('/reviews/{id}',       [AdminController::class, 'moderateReview']);
        Route::delete('/reviews/{id}',    [AdminController::class, 'destroyReview']);

        // Users
        Route::get('/users',              [AdminController::class, 'users']);

        // Export
        Route::get('/export',             [AdminController::class, 'export']);

        // Stats
        Route::get('/stats',              [AdminController::class, 'stats']);
    });
});
