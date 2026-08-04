<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('print_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('service_type', 20);
            $table->string('paper_size', 20);
            $table->unsignedSmallInteger('pages');
            $table->unsignedSmallInteger('unit_price');
            $table->unsignedInteger('total_amount');
            $table->string('notes')->nullable();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index('service_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('print_transactions');
    }
};
