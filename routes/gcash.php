<?php

use App\Http\Controllers\GcashPageController;
use App\Http\Controllers\GcashTransactionController;
use App\Http\Controllers\LoadTransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('gcash', [GcashPageController::class, 'index'])->name('gcash.index');

    Route::post('gcash/load', [LoadTransactionController::class, 'store'])->name('gcash.load.store');
    Route::put('gcash/load/{loadTransaction}', [LoadTransactionController::class, 'update'])->name('gcash.load.update');
    Route::delete('gcash/load/{loadTransaction}', [LoadTransactionController::class, 'destroy'])->name('gcash.load.destroy');

    Route::post('gcash/transactions', [GcashTransactionController::class, 'store'])->name('gcash.transactions.store');
    Route::put('gcash/transactions/{gcashTransaction}', [GcashTransactionController::class, 'update'])->name('gcash.transactions.update');
    Route::delete('gcash/transactions/{gcashTransaction}', [GcashTransactionController::class, 'destroy'])->name('gcash.transactions.destroy');
});
