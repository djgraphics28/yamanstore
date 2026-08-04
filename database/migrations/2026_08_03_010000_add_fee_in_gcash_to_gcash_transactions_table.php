<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gcash_transactions', function (Blueprint $table) {
            $table->boolean('fee_in_gcash')->default(false)->after('service_fee');
        });
    }

    public function down(): void
    {
        Schema::table('gcash_transactions', function (Blueprint $table) {
            $table->dropColumn('fee_in_gcash');
        });
    }
};
