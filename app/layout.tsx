import "./globals.css";
import { NoticeProvider } from "@/components/notice/NoticeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <NoticeProvider>{children}</NoticeProvider>
      </body>
    </html>
  );
}
