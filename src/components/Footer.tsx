import Link from "next/link";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-text-primary text-white py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-teal rounded-md flex items-center justify-center">
              <Home className="text-white w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">
              Hostlio
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            India's first direct rental connection platform. We help you find
            your room and skip the broker.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6 font-headline">Explore</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link
                href="/search"
                className="hover:text-brand-teal transition-colors"
              >
                Find Room
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="hover:text-brand-teal transition-colors"
              >
                For Students
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="hover:text-brand-teal transition-colors"
              >
                Properties
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="hover:text-brand-teal transition-colors"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 font-headline">Company</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link
                href="/about"
                className="hover:text-brand-teal transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-brand-teal transition-colors"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-brand-teal transition-colors"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-brand-teal transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 font-headline">Contact</h4>
          <p className="text-sm text-gray-400 mb-2">
            Email: support@hostlio.in
          </p>
          <p className="text-sm text-gray-400">Based in India</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-gray-800 text-center text-xs text-gray-500">
        © 2026 Hostlio by Hikmah Ventures. All rights reserved.
      </div>
    </footer>
  );
}
