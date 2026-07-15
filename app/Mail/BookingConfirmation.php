<?php

namespace App\Mail;

use App\Models\Booking;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    /**
     * Create a new message instance.
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Confirmation - '.$this->booking->booking_reference,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $reference = $this->booking->booking_reference;
        $qrCode = Encoder::encode($reference, ErrorCorrectionLevel::M());
        $matrix = $qrCode->getMatrix();
        $width = $matrix->getWidth();
        $height = $matrix->getHeight();

        $margin = 4;
        $modulesCount = $width + ($margin * 2);
        $scale = (int) floor(180 / $modulesCount);
        if ($scale < 1) {
            $scale = 1;
        }
        $imgWidth = $modulesCount * $scale;
        $imgHeight = $modulesCount * $scale;

        $image = imagecreate($imgWidth, $imgHeight);
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);

        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                if ($matrix->get($x, $y) === 1) {
                    $x1 = ($x + $margin) * $scale;
                    $y1 = ($y + $margin) * $scale;
                    $x2 = $x1 + $scale - 1;
                    $y2 = $y1 + $scale - 1;
                    imagefilledrectangle($image, $x1, $y1, $x2, $y2, $black);
                }
            }
        }

        ob_start();
        imagepng($image);
        $qrCodePng = ob_get_clean();
        imagedestroy($image);

        return new Content(
            view: 'emails.bookings.confirmation',
            with: [
                'qrCodePng' => $qrCodePng,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
