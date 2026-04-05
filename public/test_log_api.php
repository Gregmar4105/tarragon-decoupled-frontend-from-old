<?php
$logPath = __DIR__ . '/../storage/logs/laravel.log';
if (file_exists($logPath)) {
    $lines = file($logPath);
    echo implode("", array_slice($lines, -100));
} else {
    echo "Log file not found.";
}
