import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarHeart,
  FileStack,
  HomeIcon,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const highlights = [
  {
    title: "Finanzas transparentes",
    description:
      "Visualiza ingresos, egresos y morosidad en tiempo real con reportes claros y accionables.",
    icon: BarChart3,
  },
  {
    title: "Gestión documental",
    description:
      "Centraliza actas, reglamentos y contratos con control de versiones y descargas seguras.",
    icon: FileStack,
  },
  {
    title: "Comunidad conectada",
    description:
      "Calendario compartido, noticias internas y notificaciones multicanal listas para tu equipo.",
    icon: CalendarHeart,
  },
];

const featureSections = [
  {
    eyebrow: "Control financiero",
    title: "Cuotas automáticas y seguimiento de pagos",
    description:
      "Genera recibos por coeficiente de prorrateo, registra pagos y adjunta comprobantes desde cualquier dispositivo.",
    bullets: [
      "Gestión de egresos fijos y variables",
      "Conciliación manual y carga de vouchers",
      "Panel con saldo y morosidad al día",
    ],
    image: "/hero-finanzas.png",
  },
  {
    eyebrow: "Documentos y actas",
    title: "Biblioteca inteligente para tu edificio",
    description:
      "Comparte reglamentos, contratos y actas con acceso controlado, comentarios y recordatorios de renovación.",
    bullets: [
      "Almacenamiento seguro en la nube",
      "Historial de versiones y descargas",
      "Etiquetas por categoría y búsqueda instantánea",
    ],
    image: "/hero-documentos.png",
  },
  {
    eyebrow: "Comunidad",
    title: "Comunicación moderna y notificaciones automáticas",
    description:
      "Calendario colaborativo, noticias internas y avisos push/email configurables por perfil.",
    bullets: [
      "Eventos recurrentes y recordatorios",
      "Muro de anuncios con moderación",
      "Notificaciones segmentadas para residentes y staff",
    ],
    image: "/hero-comunidad.png",
  },
];

const stats = [
  { label: "Tiempo ahorrado", value: "35%" },
  { label: "Usuarios satisfechos", value: "+120" },
  { label: "Propiedades activas", value: "48" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_55%)]" />
      <section className="px-6 pb-24 pt-28 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-primary shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Plataforma multi-propiedad con seguridad empresarial
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Administra edificios con una experiencia digital impecable
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Vivienda Manager centraliza las finanzas, documentos y comunicación de tu comunidad en una sola plataforma, diseñada para equipos modernos y residentes móviles.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-foreground px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/40 transition hover:opacity-90"
                >
                  Solicitar demo
                </Link>
                <Link
                  href="/demo#finanzas"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-foreground transition hover:bg-surface-elevated hover:text-primary"
                >
                  Explorar funcionalidades
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6 rounded-3xl border border-border bg-surface-elevated px-6 py-6 shadow-inner">
                {stats.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-3xl font-semibold text-foreground">
                      {item.value}
                    </span>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="relative rounded-[2.5rem] border border-border bg-surface-elevated/80 p-6 shadow-2xl backdrop-blur">
                <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-transparent to-secondary/30 blur-3xl" />
                <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-lg">
                  <HomeIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Residencial Horizonte</p>
                    <p className="text-xs text-muted-foreground">
                      Estado general saludable, 4 avisos pendientes
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">Saldo mensual</span>
                      <span className="text-emerald-500">+S/ 4,250</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ingresos vs gastos de abril
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center gap-3">
                      <ReceiptText className="h-9 w-9 rounded-full bg-primary/10 p-2 text-primary" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">Recibos emitidos</p>
                        <p className="text-xs text-muted-foreground">
                          32 departamentos • 4 con pago pendiente
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center gap-3">
                      <BellRing className="h-9 w-9 rounded-full bg-secondary/10 p-2 text-secondary" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">Próxima asamblea</p>
                        <p className="text-xs text-muted-foreground">
                          18 de mayo • 7:00 p.m. • Salón social
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-elevated/60 px-6 py-20 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Módulos clave
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold sm:text-4xl">
              Todo lo que necesita tu junta administrativa, desde el día uno
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Configuración rápida, base de datos multi-propiedad y herramientas de colaboración integradas.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="group flex flex-col gap-4 rounded-3xl border border-transparent bg-background p-6 shadow-md transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-105">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-6xl space-y-24">
          {featureSections.map((section, index) => (
            <div
              key={section.title}
              className="grid items-center gap-10 md:grid-cols-2"
            >
              <div className={`space-y-6 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  {section.eyebrow}
                </span>
                <h3 className="text-balance text-3xl font-semibold text-foreground">
                  {section.title}
                </h3>
                <p className="text-base text-muted-foreground">{section.description}</p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="gap-2">
                  Ver módulo en detalle
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div
                className={`relative overflow-hidden rounded-[2.5rem] border border-border bg-surface-elevated p-8 shadow-xl ${
                  index % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
                <div className="flex h-full flex-col justify-between gap-6 text-sm text-muted-foreground">
                  <div className="space-y-4">
                    <p className="font-semibold text-foreground">{section.title}</p>
                    <p>{section.description}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-inner">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">
                      Próximamente
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Vista previa del módulo {section.eyebrow.toLowerCase()} con gráficos interactivos y tablas editables.
                    </p>
                  </div>
                </div>
                <div className="absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary via-primary-foreground to-secondary px-6 py-20 text-white sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              Empieza hoy
            </p>
            <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
              Tu próxima asamblea puede ser 100% digital
            </h2>
            <p className="text-lg text-white/80">
              Conecta a residentes, administra finanzas y automatiza recordatorios desde un panel intuitivo.
            </p>
          </div>
          <Button variant="secondary" size="lg" className="bg-white text-primary">
            Crear cuenta gratuita
          </Button>
        </div>
      </section>
    </main>
  );
}
