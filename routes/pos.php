<?php

use App\Http\Controllers\PosPageController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SalesPageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('pos', [PosPageController::class, 'index'])->name('pos.index');
    Route::post('pos/sales', [SaleController::class, 'store'])->name('pos.sales.store');
    Route::get('pos/sales', [SalesPageController::class, 'index'])->name('pos.sales.index');
    Route::post('pos/sales/{sale}/void', [SaleController::class, 'void'])->name('pos.sales.void');
});
