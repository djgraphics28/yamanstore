<?php

namespace App\Enums;

enum PrintServiceType: string
{
    case Mono = 'mono';
    case Color = 'color';
    case Photo = 'photo';
    case Scan = 'scan';
    case Photocopy = 'photocopy';

    public function label(): string
    {
        return match ($this) {
            self::Mono => 'Mono Print',
            self::Color => 'Color Print',
            self::Photo => 'Photo Print',
            self::Scan => 'Scan',
            self::Photocopy => 'Photocopy',
        };
    }
}
