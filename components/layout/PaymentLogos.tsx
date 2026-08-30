import Image from "next/image";

const LOGOS = [
  { src: "/images/payments/idram-logo.svg", alt: "Idram", width: 70, height: 21 },
  { src: "/images/payments/arca-logo.svg", alt: "ArCa", width: 71, height: 18 },
  { src: "/images/payments/visa-logo.svg", alt: "Visa", width: 56, height: 18 },
  { src: "/images/payments/mastercard-logo.svg", alt: "Mastercard", width: 29, height: 18 },
  { src: "/images/payments/amex-logo.png", alt: "American Express", width: 18, height: 18 },
];

export function PaymentLogos({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">{label}</span>
      <div className="flex items-center gap-4">
        {LOGOS.map((logo) => (
          <Image key={logo.alt} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
        ))}
      </div>
    </div>
  );
}
