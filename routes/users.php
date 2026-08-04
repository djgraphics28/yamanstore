<?php

use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('users/roles', [UserController::class, 'roles'])->name('users.roles');
    Route::post('users/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::put('users/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('users/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    Route::resource('users', UserController::class)->except(['show']);
});
