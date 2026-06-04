import "./globals.css";
import Navbar from "@/components/Navbar/page";

export const metadata = {
  title: "World Cup 2026 Tracker",
  description:
    "Live scores, fixtures, group standings and the knockout bracket for the FIFA World Cup 2026.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>

        <footer className="border-t border-white/10 mt-20 py-8 text-center text-xs text-white/20 font-body">
          <p>Data via https://worldcup26.ir · Updates every 30 seconds</p>
          <p className="mt-1">FIFA World Cup 2026 · USA · Canada · Mexico</p>
        </footer>
      </body>
    </html>
  );
}