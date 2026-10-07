import "./globals.css";
import Shell from "@/components/Shell";
export const metadata = { title: "Alarm & Maintenance System" };
export default function RootLayout({ children }) {
  return (<html lang="th"><body className="bg-slate-50 text-slate-800"><Shell>{children}</Shell></body></html>);
}
