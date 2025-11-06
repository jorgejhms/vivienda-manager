import Link from "next/link";
import { Home, Layers, Library, Newspaper, Settings } from "lucide-react";
import type { ReactNode } from "react";

const navigation = [
  { href: "/demo", label: "Resumen", icon: Home },
  { href: "/demo#finanzas", label: "Finanzas", icon: Layers },
  { href: "/demo#inventario", label: "Inventario", icon: Settings },
  { href: "/demo#documentos", label: "Documentos", icon: Library },
  { href: "/demo#comunicaciones", label: "Comunidad", icon: Newspaper },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 md:px-16 lg:px-24">
          <Link href="/" className="text-lg font-semibold">
            Vivienda Manager
          </Link>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            Regresar al landing
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 md:px-16 lg:px-24">{children}</main>
    </div>
  );
}
