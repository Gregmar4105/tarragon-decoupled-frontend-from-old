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
        $size = $modulesCount * $scale;

        $pixelData = '';
        for ($y = 0; $y < $size; $y++) {
            $pixelData .= "\x00"; // Row filter type 0 (None)

            $matrixY = (int) floor($y / $scale) - $margin;

            for ($x = 0; $x < $size; $x++) {
                $matrixX = (int) floor($x / $scale) - $margin;

                $isBlack = false;
                if ($matrixY >= 0 && $matrixY < $height && $matrixX >= 0 && $matrixX < $width) {
                    if ($matrix->get($matrixX, $matrixY) === 1) {
                        $isBlack = true;
                    }
                }

                $pixelData .= $isBlack ? "\x00" : "\xff";
            }
        }

        $compressed = gzcompress($pixelData, 9);

        $qrCodePng = "\x89PNG\r\n\x1a\n";

        // IHDR chunk: 13 bytes
        $ihdrData = pack('NNCCCCC', $size, $size, 8, 0, 0, 0, 0);
        $qrCodePng .= pack('N', 13).'IHDR'.$ihdrData.pack('N', crc32('IHDR'.$ihdrData));

        // IDAT chunk
        $qrCodePng .= pack('N', strlen($compressed)).'IDAT'.$compressed.pack('N', crc32('IDAT'.$compressed));

        // IEND chunk
        $qrCodePng .= pack('N', 0).'IEND'.pack('N', crc32('IEND'));

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
