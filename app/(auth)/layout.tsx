// app/(auth)/layout.tsx
// Hapus import globals.css di sini jika sudah ada di RootLayout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
      {children}
    </main>
  );
}