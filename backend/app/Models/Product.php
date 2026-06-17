<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $fillable = ['name', 'description', 'price', 'stock', 'category_id', 'image', 'status'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function getImageUrlAttribute(): string
    {
        $img = $this->attributes['image'] ?? '';
        if (empty($img)) return '';
        if (str_starts_with($img, 'http')) return $img;
        return '/' . ltrim($img, '/');
    }

    public function getAverageRatingAttribute(): float
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }

    public function getReviewsCountAttribute(): int
    {
        return $this->reviews()->count();
    }
}
