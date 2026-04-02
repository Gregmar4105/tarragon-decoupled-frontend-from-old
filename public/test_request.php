<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/', 'GET');
$response = $kernel->handle($request);
echo "STATUS: " . $response->getStatusCode() . "\n";
echo "HEADERS: \n" . print_r($response->headers->all(), true) . "\n";
// echo "CONTENT: \n" . $response->getContent() . "\n";
