<?php

use App\Http\Controllers\PrintPageController;
use App\Http\Controllers\PrintTransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('print', [PrintPageController::class, 'index'])->name('print.index');
    Route::post('print', [PrintTransactionController::class, 'store'])->name('print.store');
    Route::put('print/{printTransaction}', [PrintTransactionController::class, 'update'])->name('print.update');
    Route::delete('print/{printTransaction}', [PrintTransactionController::class, 'destroy'])->name('print.destroy');
});
