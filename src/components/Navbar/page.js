"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Live" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/standings", label: "Groups" },
  { href: "/bracket", label: "Bracket" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-pitch/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display text-2xl text-gold tracking-wider group-hover:text-white transition-colors">
            26
          </span>

          <span className="font-body text-sm font-semibold text-white/80 group-hover:text-white transition-colors uppercase tracking-widest">
            World Cup 2026
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-200 ${
                  active
                    ? "bg-gold text-pitch font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}