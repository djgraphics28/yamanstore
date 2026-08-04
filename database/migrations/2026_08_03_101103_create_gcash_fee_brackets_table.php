<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gcash_fee_brackets', function (Blueprint $table) {
            $table->id();
            $table->string('schedule_type', 10); // 'gcash' or 'load'
            $table->unsignedInteger('min_amount');
            $table->unsignedInteger('max_amount');
            $table->unsignedInteger('fee');
            $table->timestamps();
            $table->index(['schedule_type', 'min_amount']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gcash_fee_brackets');
    }
};
