<?php

use App\Models\Booking;
use App\Models\Plan;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use PragmaRX\Google2FA\Google2FA;

beforeEach(function () {
    // Seed standard plan for testing (required by BookingService)
    Plan::create([
        'id' => 1,
        'name' => 'Standard Plan',
        'price' => 100,
        'price_small' => 50,
        'price_medium' => 100,
        'price_large' => 150,
        'price_plus' => 200,
        'duration_hours' => 24,
        'billing_cycle' => 'daily',
        'is_active' => true,
    ]);
});

test('health check returns ok', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'ok',
        ]);
});

test('user can register', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'two_factor_enabled'],
            'token',
        ]);

    $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
});

test('user can login', function () {
    $user = User::create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'two_factor_enabled'],
            'token',
        ]);
});

test('authenticated user can view profile', function () {
    $user = User::create([
        'name' => 'Alice',
        'email' => 'alice@example.com',
        'password' => Hash::make('password123'),
    ]);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/v1/user');

    $response->assertStatus(200)
        ->assertJson([
            'user' => [
                'email' => 'alice@example.com',
            ],
        ]);
});

test('authenticated user can update profile', function () {
    $user = User::create([
        'name' => 'Bob',
        'email' => 'bob@example.com',
        'password' => Hash::make('password123'),
    ]);

    Sanctum::actingAs($user);

    $response = $this->putJson('/api/v1/user/profile', [
        'name' => 'Bobby',
        'email' => 'bobby@example.com',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'user' => [
                'name' => 'Bobby',
                'email' => 'bobby@example.com',
            ],
        ]);

    $this->assertDatabaseHas('users', ['email' => 'bobby@example.com']);
});

test('authenticated user can update password', function () {
    $user = User::create([
        'name' => 'Charlie',
        'email' => 'charlie@example.com',
        'password' => Hash::make('password123'),
    ]);

    Sanctum::actingAs($user);

    $response = $this->putJson('/api/v1/user/password', [
        'current_password' => 'password123',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Password updated successfully',
        ]);

    $user->refresh();
    $this->assertTrue(Hash::check('newpassword123', $user->password));
});

test('user can enable confirm and disable 2fa', function () {
    $user = User::create([
        'name' => 'Dave',
        'email' => 'dave@example.com',
        'password' => Hash::make('password123'),
    ]);

    Sanctum::actingAs($user);

    // 1. Enable 2FA
    $response = $this->postJson('/api/v1/auth/two-factor/enable');
    $response->assertStatus(200)
        ->assertJsonStructure(['qr_code', 'recovery_codes']);

    $user->refresh();
    $this->assertNotNull($user->two_factor_secret);
    $this->assertNull($user->two_factor_confirmed_at);

    // 2. Confirm 2FA (We need to use the PragmaRX\Google2FA\Google2FA to generate a valid code)
    $google2fa = new Google2FA;
    $code = $google2fa->getCurrentOtp(decrypt($user->two_factor_secret));

    $response = $this->postJson('/api/v1/auth/two-factor/confirm', [
        'code' => $code,
    ]);
    $response->assertStatus(200)
        ->assertJson(['message' => 'Two-factor authentication confirmed successfully.']);

    $user->refresh();
    $this->assertNotNull($user->two_factor_confirmed_at);

    // 3. Disable 2FA
    $response = $this->deleteJson('/api/v1/auth/two-factor/disable');
    $response->assertStatus(200)
        ->assertJson(['message' => 'Two-factor authentication disabled successfully.']);

    $user->refresh();
    $this->assertNull($user->two_factor_secret);
    $this->assertNull($user->two_factor_confirmed_at);
});

test('public pricing plans are returned', function () {
    $response = $this->getJson('/api/v1/pricing-plans/public');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'price_small',
                    'price_regular',
                    'price_large',
                    'price_plus',
                    'is_active',
                ],
            ],
        ]);
});

test('plans management crud by admin', function () {
    $user = User::create([
        'name' => 'Admin User',
        'email' => 'admin_test@example.com',
        'password' => Hash::make('password123'),
    ]);

    Sanctum::actingAs($user);

    // 1. Index
    $response = $this->getJson('/api/v1/pricing-plans');
    $response->assertStatus(200)
        ->assertJsonCount(1, 'data'); // 1 seeded in beforeEach

    // 2. Store
    $response = $this->postJson('/api/v1/pricing-plans', [
        'name' => 'Custom Plan',
        'price' => 40,
        'price_small' => 20,
        'price_regular' => 40,
        'price_large' => 60,
        'price_plus' => 85,
        'is_active' => true,
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'data' => [
                'name' => 'Custom Plan',
                'price_regular' => 40.0,
            ],
        ]);

    $this->assertDatabaseHas('plans', [
        'name' => 'Custom Plan',
        'price_medium' => 40, // standard mapped to price_medium
    ]);

    $planId = $response->json('data.id');

    // 3. Update
    $response = $this->putJson("/api/v1/pricing-plans/{$planId}", [
        'name' => 'Updated Custom Plan',
        'price' => 45,
        'price_small' => 25,
        'price_regular' => 45,
        'price_large' => 65,
        'price_plus' => 90,
        'is_active' => true,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'name' => 'Updated Custom Plan',
                'price_regular' => 45.0,
            ],
        ]);

    // 4. Destroy
    $response = $this->deleteJson("/api/v1/pricing-plans/{$planId}");
    $response->assertStatus(200);
});

test('public user can make online booking', function () {
    $response = $this->postJson('/api/v1/bookings/public', [
        'name' => 'Guest User',
        'email' => 'guest@example.com',
        'phone' => '1234567890',
        'dropoff' => '2026-07-10 10:00',
        'pickup' => '2026-07-10 18:00',
        'price' => 200,
        'size_counts' => [
            'small' => 0,
            'regular' => 2,
            'large' => 0,
            'plus' => 0,
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'email',
                'dropoff',
                'pickup',
                'size',
                'price',
            ],
        ]);

    $this->assertDatabaseHas('bookings', [
        'customer_email' => 'guest@example.com',
        'source' => 'online',
    ]);
});

test('admin can manage bookings', function () {
    $user = User::create([
        'name' => 'Admin User',
        'email' => 'admin_test@example.com',
        'password' => Hash::make('password123'),
    ]);

    Sanctum::actingAs($user);

    // 1. Create walk-in booking
    $response = $this->postJson('/api/v1/bookings', [
        'name' => 'Walkin Customer',
        'email' => 'walkin@example.com',
        'phone' => '0987654321',
        'dropoff' => '2026-07-10 10:00',
        'pickup' => '2026-07-10 18:00',
        'price' => 300,
        'status' => 'checked-in',
        'tag_number' => 'TAG-9999',
        'payment_option' => 'pay-now',
        'size_counts' => [
            'small' => 1,
            'regular' => 1,
            'large' => 0,
            'plus' => 0,
        ],
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'data' => [
                'name' => 'Walkin Customer',
                'status' => 'checked-in',
                'payment_status' => 'successful',
            ],
        ]);

    $bookingRef = $response->json('data.id');

    // 2. Fetch bookings list (index)
    $response = $this->getJson('/api/v1/bookings?status=checked-in');
    $response->assertStatus(200)
        ->assertJsonFragment(['name' => 'Walkin Customer']);

    // 3. Update booking (Check out / process payment update)
    $response = $this->putJson("/api/v1/bookings/{$bookingRef}", [
        'status' => 'checked-out',
        'payment_status' => 'successful',
        'payment_method' => 'card',
        'transaction_id' => 'TXN-12345',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'status' => 'completed', // checked-out mapped to completed
                'payment_status' => 'successful',
                'payment_method' => 'Card',
                'transaction_id' => 'TXN-12345',
            ],
        ]);
});

test('admin can fetch activities', function () {
    $user = User::create([
        'name' => 'Admin User',
        'email' => 'admin_test@example.com',
        'password' => Hash::make('password123'),
    ]);

    Sanctum::actingAs($user);

    // Make an online booking to generate some audit logs
    $this->postJson('/api/v1/bookings/public', [
        'name' => 'Guest User',
        'email' => 'guest@example.com',
        'phone' => '1234567890',
        'dropoff' => '2026-07-10 10:00',
        'pickup' => '2026-07-10 18:00',
        'price' => 200,
        'size_counts' => [
            'small' => 0,
            'regular' => 2,
            'large' => 0,
            'plus' => 0,
        ],
    ]);

    $response = $this->getJson('/api/v1/reports/activities');
    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'user_name',
                    'event',
                    'activity',
                    'created_at',
                    'ip_address',
                    'type',
                ],
            ],
        ]);
});
