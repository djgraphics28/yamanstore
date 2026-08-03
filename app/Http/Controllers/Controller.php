<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

abstract class Controller
{
    use AuthorizesRequests;

    /**
     * Resolve the paginator page size from the request, restricted to a safe
     * allow-list so users can't request an unbounded number of rows.
     */
    protected function perPage(Request $request, int $default = 15): int
    {
        $allowed = [10, 15, 25, 50, 100];
        $requested = $request->integer('per_page');

        return in_array($requested, $allowed, true) ? $requested : $default;
    }
}
