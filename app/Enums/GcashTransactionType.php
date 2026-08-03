<?php

namespace App\Enums;

enum GcashTransactionType: string
{
    case CashIn = 'cash_in';
    case CashOut = 'cash_out';
}
