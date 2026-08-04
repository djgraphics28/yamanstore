<?php

namespace App\Enums;

enum PrintPaperSize: string
{
    case Short = 'short';
    case A4 = 'a4';
    case Long = 'long';
    case PhotoFull = 'photo_full';
    case PhotoHalf = 'photo_half';

    public function label(): string
    {
        return match ($this) {
            self::Short => 'Short',
            self::A4 => 'A4',
            self::Long => 'Long',
            self::PhotoFull => 'Full Page',
            self::PhotoHalf => 'Half Page',
        };
    }
}
