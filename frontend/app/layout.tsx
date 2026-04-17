import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrimeClean Australia | Professional Cleaning Services",
  description: "Australia's premier cleaning service. Office, medical, and industrial cleaning across NSW, VIC, QLD. Fully insured, police-checked staff.",
  keywords: ["cleaning services", "office cleaning", "medical cleaning", "Sydney", "Melbourne", "Brisbane", "Australia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className="antialiased">
        <header className="border-b">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-prime-600">PrimeClean</div>
            <div className="flex gap-6">
              <a href="/" className="hover:text-prime-600">Home</a>
              <a href="/services" className="hover:text-prime-600">Services</a>
              <a href="/contact" className="hover:text-prime-600">Contact</a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
