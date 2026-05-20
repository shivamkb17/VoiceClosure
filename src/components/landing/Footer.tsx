import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = {
  Product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Demo", href: "/demo" },
  ],
  Company: [
    { name: "About", href: "" },
    { name: "Blog", href: "" },
    { name: "Contact", href: "" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "" },
    { name: "Terms of Service", href: "" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Voice<span className="gradient-text-static">Closer</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              AI-powered voice receptionist for small businesses. Never miss a
              customer again.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="text-sm text-muted hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground cursor-default">
                        {link.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VoiceCloser AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for small businesses
          </p>
        </div>
      </div>
    </footer>
  );
}
