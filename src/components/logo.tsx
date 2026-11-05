import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <Image
        src="https://res.cloudinary.com/dtsogqaba/image/upload/v1777376526/Hostlio/hostlio.webp"
        alt="Hostlio Logo"
        width={32}
        height={32}
        className="w-8 h-8 rounded-md"
      />
      <span className="font-headline font-bold text-xl text-brand-text-primary tracking-tight">
        Hostlio
      </span>
    </Link>
  );
}
