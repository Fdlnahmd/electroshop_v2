<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table   = 'reviews';
    public $timestamps = false;
    const CREATED_AT   = 'created_at';
    const UPDATED_AT   = null;
    protected $fillable = ['user_id','order_id','product_id','rating','comment','status'];

    public function user()    { return $this->belongsTo(User::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
