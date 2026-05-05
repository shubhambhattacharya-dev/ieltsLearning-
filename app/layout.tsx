import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LingoMaster AI - Master English Dynamically",
  description: "Learn English through AI interviews, script reading, and real-time grammar feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              Lingo<span className="text-primary-gradient">Master</span>
            </Link>
            <div className="nav-links">
              <Link href="/interview" className="nav-link">IELTS Interview</Link>
              <Link href="/grammar" className="nav-link">Grammar</Link>
              <Link href="/reading" className="nav-link">Reading</Link>
              <Link href="/shadowing" className="nav-link">Shadowing</Link>
              <Link href="/vocabulary" className="nav-link">Vocabulary</Link>
              <Link href="/debate" className="nav-link">Debate</Link>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
            </div>
          </div>
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
