import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/toast-provider";
import SiteFooter from "@/components/site-footer";

export const metadata = {
  title: "BeGuided",
  description: "Guiding Students Towards Better Academic Decisions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
  <div className="flex min-h-screen flex-col">
    <div className="flex-1">{children}</div>
    <SiteFooter />
  </div>
</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}