import Link from "next/link";

const accountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/bookings", label: "My Bookings" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/settings", label: "Settings" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 px-6 md:px-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl mb-8">My Account</h1>
        <div className="flex gap-8 flex-col md:flex-row">
          {/* SIDEBAR */}
          <nav className="md:w-48 flex md:flex-col gap-2">
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.9rem] px-4 py-2 rounded-md hover:bg-green/10 hover:text-green transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CONTENT */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
