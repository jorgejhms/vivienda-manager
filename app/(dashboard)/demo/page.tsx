import { ensureDemoData, getMonthDateRange, DEMO_IDS } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  createAnnouncement,
  createDocument,
  createEvent,
  createInventoryItem,
  createNotification,
  createTransaction,
  generateInvoices,
  markInvoiceAsPaid,
  reopenInvoice,
} from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BadgeCheck, BellRing, CalendarClock, FileText, Plus, Receipt, Shield } from "lucide-react";
import type { Metadata } from "next";
import type { ElementType, ReactNode } from "react";
import { MonthSelector } from "./month-selector";

export const metadata: Metadata = {
  title: "Demo | Vivienda Manager",
};

const statuses = {
  PENDING: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-900",
  },
  PARTIALLY_PAID: {
    label: "Pago parcial",
    color: "bg-sky-100 text-sky-900",
  },
  PAID: {
    label: "Pagado",
    color: "bg-emerald-100 text-emerald-900",
  },
} as const;

function formatCurrency(value: number, currency = "PEN") {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  id,
}: {
  title: string;
  description: string;
  icon: ElementType;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="space-y-6 rounded-3xl border border-border bg-background/90 p-8 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export default async function DemoPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await ensureDemoData();

  const monthParam =
    typeof searchParams?.month === "string"
      ? searchParams?.month
      : format(new Date(), "yyyy-MM");
  const { start, end } = getMonthDateRange(monthParam);

  const [property, transactions, inventory, invoices, documents, announcements, events, notifications] =
    await Promise.all([
      prisma.property.findUniqueOrThrow({
        where: { id: DEMO_IDS.propertyId },
      }),
      prisma.transaction.findMany({
        where: { propertyId: DEMO_IDS.propertyId },
        orderBy: { occurredAt: "desc" },
      }),
      prisma.inventoryItem.findMany({
        where: { propertyId: DEMO_IDS.propertyId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.findMany({
        where: { propertyId: DEMO_IDS.propertyId },
        include: { unit: true },
        orderBy: { period: "desc" },
      }),
      prisma.document.findMany({
        where: { propertyId: DEMO_IDS.propertyId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.announcement.findMany({
        where: { propertyId: DEMO_IDS.propertyId },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.event.findMany({
        where: { propertyId: DEMO_IDS.propertyId },
        orderBy: { startsAt: "asc" },
      }),
      prisma.notification.findMany({
        where: { propertyId: DEMO_IDS.propertyId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const monthlyTransactions = transactions.filter(
    (tx) => tx.occurredAt >= start && tx.occurredAt <= end
  );
  const totals = monthlyTransactions.reduce(
    (acc, tx) => {
      const amount = Number(tx.amount);
      if (tx.type === "INCOME") {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );
  const netBalance = totals.income - totals.expense;

  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "PAID");
  const receivables = pendingInvoices.reduce(
    (acc, invoice) => acc + (Number(invoice.amountDue) - Number(invoice.amountPaid)),
    0
  );

  const monthLabel = format(start, "MMMM yyyy", { locale: es });

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-secondary/10 to-primary-foreground/10 p-8 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Panel demo</p>
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{property.name}</h1>
            <p className="text-sm text-muted-foreground">{property.address}</p>
          </div>
          <MonthSelector month={monthParam} />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background/90 p-4">
            <p className="text-xs text-muted-foreground">Ingresos {monthLabel}</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {formatCurrency(totals.income, property.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/90 p-4">
            <p className="text-xs text-muted-foreground">Egresos {monthLabel}</p>
            <p className="mt-2 text-2xl font-semibold text-rose-500">
              {formatCurrency(totals.expense, property.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/90 p-4">
            <p className="text-xs text-muted-foreground">Balance neto</p>
            <p className={cn("mt-2 text-2xl font-semibold", netBalance >= 0 ? "text-emerald-600" : "text-rose-500")}
            >
              {formatCurrency(netBalance, property.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/90 p-4">
            <p className="text-xs text-muted-foreground">Morosidad</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">
              {formatCurrency(receivables, property.currency)}
            </p>
          </div>
        </div>
      </div>

      <SectionCard
        id="finanzas"
        title="Finanzas del edificio"
        description="Registra ingresos y egresos, genera cuotas mensuales y consulta el historial de pagos."
        icon={Receipt}
      >
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Movimientos {monthLabel}
            </h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Detalle</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Monto</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {monthlyTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No hay movimientos registrados este mes.
                      </td>
                    </tr>
                  ) : (
                    monthlyTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-elevated/60">
                        <td className="px-4 py-3 text-sm">
                          {format(tx.occurredAt, "dd/MM", { locale: es })}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{tx.description ?? "Sin detalle"}</td>
                        <td
                          className={cn(
                            "px-4 py-3 text-right text-sm font-semibold",
                            tx.type === "INCOME" ? "text-emerald-600" : "text-rose-500"
                          )}
                        >
                          {formatCurrency(Number(tx.amount), property.currency)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {tx.type.replace(/_/g, " ")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Registrar movimiento
            </h3>
            <form action={createTransaction} className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="amount">
                  Monto
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="type">
                  Tipo
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                >
                  <option value="INCOME">Ingreso</option>
                  <option value="EXPENSE_FIXED">Gasto fijo</option>
                  <option value="EXPENSE_VARIABLE">Gasto variable</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="date">
                  Fecha
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="description">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                  placeholder="Ej. Pago de proveedor, cuota extraordinaria"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-foreground px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> Guardar transacción
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Historial de recibos
            </h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unidad</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Periodo</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Monto</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Aún no se han generado recibos.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => {
                      const statusInfo =
                        statuses[invoice.status as keyof typeof statuses] ?? statuses.PENDING;
                      return (
                        <tr key={invoice.id} className="hover:bg-surface-elevated/60">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{invoice.unit.label}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(invoice.period, "MMMM yyyy", { locale: es })}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                          {formatCurrency(Number(invoice.amountDue), property.currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                              statusInfo.color
                            )}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {invoice.status === "PAID" ? (
                            <form action={reopenInvoice}>
                              <input type="hidden" name="invoiceId" value={invoice.id} />
                              <button
                                type="submit"
                                className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                              >
                                Reabrir
                              </button>
                            </form>
                          ) : (
                            <form action={markInvoiceAsPaid}>
                              <input type="hidden" name="invoiceId" value={invoice.id} />
                              <button
                                type="submit"
                                className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                              >
                                Registrar pago completo
                              </button>
                            </form>
                          )}
                        </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Calcular cuota mensual
            </h3>
            <form action={generateInvoices} className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="month-generate">
                  Mes
                </label>
                <input
                  id="month-generate"
                  name="month"
                  type="month"
                  defaultValue={monthParam}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="summary">
                  Resumen en recibo
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  placeholder="Ej. Mantenimiento, limpieza y seguridad del mes"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary to-primary px-4 py-2 text-sm font-semibold text-white"
              >
                <BadgeCheck className="h-4 w-4" /> Generar recibos
              </button>
            </form>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="inventario"
        title="Inventario y activos"
        description="Registra el equipamiento común y controla renovaciones o mantenimientos."
        icon={Shield}
      >
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {inventory.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-background/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {item.category}
                    </span>
                  </div>
                  <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {item.purchaseDate && (
                      <div className="flex justify-between">
                        <dt>Adquirido</dt>
                        <dd>{format(item.purchaseDate, "dd/MM/yyyy")}</dd>
                      </div>
                    )}
                    {item.value && (
                      <div className="flex justify-between">
                        <dt>Valor</dt>
                        <dd>{formatCurrency(Number(item.value), property.currency)}</dd>
                      </div>
                    )}
                    {item.condition && (
                      <div className="flex justify-between">
                        <dt>Estado</dt>
                        <dd>{item.condition}</dd>
                      </div>
                    )}
                  </dl>
                  {item.notes && <p className="mt-3 text-xs text-muted-foreground">{item.notes}</p>}
                </div>
              ))}
              {inventory.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No hay activos registrados todavía.
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Registrar activo
            </h3>
            <form action={createInventoryItem} className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="name">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="category">
                  Categoría
                </label>
                <input
                  id="category"
                  name="category"
                  placeholder="Ej. Seguridad, Limpieza"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="purchaseDate">
                  Fecha de compra
                </label>
                <input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="value">
                  Valor estimado
                </label>
                <input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="condition">
                  Estado actual
                </label>
                <input
                  id="condition"
                  name="condition"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="notes">
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                  placeholder="Indicaciones de mantenimiento, garantía, etc."
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-foreground px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> Guardar activo
              </button>
            </form>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="documentos"
        title="Biblioteca documental"
        description="Centraliza reglamentos, actas y contratos en un repositorio colaborativo."
        icon={FileText}
      >
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4">
            {documents.map((doc) => (
              <article
                key={doc.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-background/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.description ?? "Documento sin descripción"}</p>
                  <p className="mt-1 text-xs text-primary underline-offset-2">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="hover:underline">
                      Abrir documento
                    </a>
                  </p>
                </div>
                <span className="self-start rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                  {doc.category}
                </span>
              </article>
            ))}
            {documents.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No se han cargado documentos todavía.
              </p>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Registrar documento
            </h3>
            <form action={createDocument} className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="title-doc">
                  Título
                </label>
                <input
                  id="title-doc"
                  name="title"
                  required
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="category-doc">
                  Categoría
                </label>
                <select
                  id="category-doc"
                  name="category"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                >
                  <option value="STATUTE">Estatuto</option>
                  <option value="REGULATION">Reglamento</option>
                  <option value="CONTRACT">Contrato</option>
                  <option value="MINUTE">Acta</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="url">
                  Enlace (URL)
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://"
                  required
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="description-doc">
                  Descripción
                </label>
                <textarea
                  id="description-doc"
                  name="description"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary to-primary px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> Guardar documento
              </button>
            </form>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="comunicaciones"
        title="Calendario, noticias y notificaciones"
        description="Comparte anuncios, eventos y recordatorios multicanal con toda la comunidad."
        icon={BellRing}
      >
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Portal de noticias</h3>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <article key={announcement.id} className="rounded-2xl border border-border bg-background/90 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-foreground">{announcement.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{announcement.content}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    {format(announcement.publishedAt, "dd MMM yyyy", { locale: es })}
                  </p>
                </article>
              ))}
              {announcements.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Sin anuncios publicados.
                </p>
              )}
            </div>
            <form action={createAnnouncement} className="space-y-3 rounded-2xl border border-border bg-background/90 p-4 text-sm">
              <h4 className="text-sm font-semibold text-foreground">Nuevo anuncio</h4>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="announcement-title">
                  Título
                </label>
                <input
                  id="announcement-title"
                  name="title"
                  required
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="announcement-content">
                  Contenido
                </label>
                <textarea
                  id="announcement-content"
                  name="content"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-foreground px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> Publicar anuncio
              </button>
            </form>
          </div>

          <div className="space-y-4 xl:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Calendario</h3>
            <div className="space-y-3">
              {events.map((event) => (
                <article key={event.id} className="rounded-2xl border border-border bg-background/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-foreground">{event.title}</h4>
                    {event.recurring && (
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondary">
                        Recurrente
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                  )}
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    {format(event.startsAt, "dd MMM yyyy", { locale: es })}
                    {event.endsAt && event.endsAt.toDateString() !== event.startsAt.toDateString()
                      ? ` – ${format(event.endsAt, "dd MMM yyyy", { locale: es })}`
                      : null}
                  </p>
                </article>
              ))}
              {events.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No hay eventos programados.
                </p>
              )}
            </div>
            <form action={createEvent} className="space-y-3 rounded-2xl border border-border bg-background/90 p-4 text-sm">
              <h4 className="text-sm font-semibold text-foreground">Nuevo evento</h4>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="event-title">
                  Título
                </label>
                <input
                  id="event-title"
                  name="title"
                  required
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="event-description">
                  Descripción
                </label>
                <textarea
                  id="event-description"
                  name="description"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="startsAt">
                  Inicio
                </label>
                <input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  required
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="endsAt">
                  Fin
                </label>
                <input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <input type="checkbox" name="recurring" className="h-4 w-4 rounded border-border" /> Evento recurrente
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary to-primary px-4 py-2 text-sm font-semibold text-white"
              >
                <CalendarClock className="h-4 w-4" /> Programar evento
              </button>
            </form>
          </div>

          <div className="space-y-4 xl:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Notificaciones
            </h3>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <article key={notification.id} className="rounded-2xl border border-border bg-background/90 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-foreground">{notification.subject}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    <span>{notification.channel}</span>
                    <span>{notification.audience}</span>
                  </div>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    {format(notification.createdAt, "dd MMM yyyy HH:mm", { locale: es })}
                  </p>
                </article>
              ))}
              {notifications.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Aún no se han generado notificaciones.
                </p>
              )}
            </div>
            <form action={createNotification} className="space-y-3 rounded-2xl border border-border bg-background/90 p-4 text-sm">
              <h4 className="text-sm font-semibold text-foreground">Nueva notificación</h4>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="subject">
                  Asunto
                </label>
                <input
                  id="subject"
                  name="subject"
                  required
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="message">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground" htmlFor="audience">
                    Audiencia
                  </label>
                  <select
                    id="audience"
                    name="audience"
                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                  >
                    <option value="ALL_RESIDENTS">Todos los residentes</option>
                    <option value="ADMINS">Administradores</option>
                    <option value="STAFF">Equipo de apoyo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground" htmlFor="channel">
                    Canal
                  </label>
                  <select
                    id="channel"
                    name="channel"
                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                  >
                    <option value="IN_APP">En la plataforma</option>
                    <option value="EMAIL">Correo electrónico</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-medium text-foreground" htmlFor="scheduledAt">
                  Programar envío
                </label>
                <input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-foreground px-4 py-2 text-sm font-semibold text-white"
              >
                <BellRing className="h-4 w-4" /> Enviar notificación
              </button>
            </form>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
