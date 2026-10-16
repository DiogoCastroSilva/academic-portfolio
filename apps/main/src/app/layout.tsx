import { NavBar } from '@katie-portfolio/navigation';
import './global.css';
import { CloudflareAnalytics } from './ui/CloudflareAnalytics';
import { Footer } from './ui/Footer';

export const metadata = {
  title: 'Kathleen Miller',
  description:
    'Portfolio of Kathleen Miller — science, nature-based solutions, projects, and publications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-full bg-stone-100 dark:bg-slate-800"
      >
        <div className="flex min-h-full flex-col">
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
