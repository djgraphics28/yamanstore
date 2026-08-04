<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gcash_opening_balances', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->integer('cash_on_hand')->default(0);
            $table->integer('gcash_balance')->default(0);
            $table->string('notes')->nullable();
            $table->foreignId('user_id')->constrained();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gcash_opening_balances');
    }
};
