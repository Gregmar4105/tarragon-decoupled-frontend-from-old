<?php
$log = file_get_contents('C:\Users\Jeffrey\Herd\tarragon\storage\logs\laravel.log');
$lines = explode("\n", $log);
$last = array_slice($lines, -100);
echo implode("\n", $last);
