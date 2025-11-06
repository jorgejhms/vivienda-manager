"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEMO_IDS, getMonthDateRange } from "@/lib/demo-data";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const DEMO_PATH = "/demo";

const TRANSACTION_TYPES = ["INCOME", "EXPENSE_FIXED", "EXPENSE_VARIABLE"] as const;
const DOCUMENT_CATEGORIES = ["STATUTE", "REGULATION", "CONTRACT", "MINUTE", "OTHER"] as const;
const NOTIFICATION_AUDIENCES = ["ALL_RESIDENTS", "ADMINS", "STAFF"] as const;
const NOTIFICATION_CHANNELS = ["IN_APP", "EMAIL"] as const;

function decimalFromForm(value: FormDataEntryValue | null) {
  if (!value) return new Prisma.Decimal(0);
  const numeric = parseFloat(String(value));
  if (Number.isNaN(numeric)) {
    throw new Error("El monto debe ser numérico");
  }
  return new Prisma.Decimal(numeric.toFixed(2));
}

function parseDate(value: FormDataEntryValue | null) {
  if (!value) return new Date();
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Fecha inválida");
  }
  return parsed;
}

export async function createTransaction(formData: FormData) {
  try {
    const amount = decimalFromForm(formData.get("amount"));
    const typeRaw = String(formData.get("type") ?? "INCOME");
    const type = TRANSACTION_TYPES.includes(typeRaw as (typeof TRANSACTION_TYPES)[number])
      ? typeRaw
      : "INCOME";
    const description = String(formData.get("description") ?? "").trim();
    const occurredAt = parseDate(formData.get("date"));

    await prisma.transaction.create({
      data: {
        amount,
        type,
        description,
        occurredAt,
        propertyId: DEMO_IDS.propertyId,
      },
    });
  } catch (error) {
    console.error("Error al crear transacción", error);
    throw error;
  }
  revalidatePath(DEMO_PATH);
}

export async function createInventoryItem(formData: FormData) {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const category = String(formData.get("category") ?? "Otros").trim();
    const purchaseDate = formData.get("purchaseDate") ? parseDate(formData.get("purchaseDate")) : null;
    const value = formData.get("value") ? decimalFromForm(formData.get("value")) : null;
    const condition = String(formData.get("condition") ?? "").trim() || null;
    const notes = String(formData.get("notes") ?? "").trim() || null;

    await prisma.inventoryItem.create({
      data: {
        name,
        category,
        purchaseDate: purchaseDate ?? undefined,
        value: value ?? undefined,
        condition,
        notes,
        propertyId: DEMO_IDS.propertyId,
      },
    });
  } catch (error) {
    console.error("Error al crear activo", error);
    throw error;
  }
  revalidatePath(DEMO_PATH);
}

export async function createDocument(formData: FormData) {
  try {
    const title = String(formData.get("title") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim();
    const categoryRaw = String(formData.get("category") ?? "OTHER").trim();
    const category = DOCUMENT_CATEGORIES.includes(categoryRaw as (typeof DOCUMENT_CATEGORIES)[number])
      ? categoryRaw
      : "OTHER";
    const description = String(formData.get("description") ?? "").trim() || null;

    await prisma.document.create({
      data: {
        title,
        url,
        category,
        description,
        propertyId: DEMO_IDS.propertyId,
      },
    });
  } catch (error) {
    console.error("Error al crear documento", error);
    throw error;
  }
  revalidatePath(DEMO_PATH);
}

export async function createAnnouncement(formData: FormData) {
  try {
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();

    await prisma.announcement.create({
      data: {
        title,
        content,
        propertyId: DEMO_IDS.propertyId,
      },
    });
  } catch (error) {
    console.error("Error al crear anuncio", error);
    throw error;
  }
  revalidatePath(DEMO_PATH);
}

export async function createEvent(formData: FormData) {
  try {
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    const startsAt = parseDate(formData.get("startsAt"));
    const endsAt = formData.get("endsAt") ? parseDate(formData.get("endsAt")) : null;
    const recurring = formData.get("recurring") === "on";

    await prisma.event.create({
      data: {
        title,
        description,
        startsAt,
        endsAt: endsAt ?? undefined,
        recurring,
        propertyId: DEMO_IDS.propertyId,
      },
    });
  } catch (error) {
    console.error("Error al crear evento", error);
    throw error;
  }
  revalidatePath(DEMO_PATH);
}

export async function createNotification(formData: FormData) {
  try {
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const audienceRaw = String(formData.get("audience") ?? "ALL_RESIDENTS").trim();
    const channelRaw = String(formData.get("channel") ?? "IN_APP").trim();
    const audience = NOTIFICATION_AUDIENCES.includes(audienceRaw as (typeof NOTIFICATION_AUDIENCES)[number])
      ? audienceRaw
      : "ALL_RESIDENTS";
    const channel = NOTIFICATION_CHANNELS.includes(channelRaw as (typeof NOTIFICATION_CHANNELS)[number])
      ? channelRaw
      : "IN_APP";
    const scheduledAt = formData.get("scheduledAt") ? parseDate(formData.get("scheduledAt")) : null;

    await prisma.notification.create({
      data: {
        subject,
        message,
        audience,
        channel,
        scheduledAt: scheduledAt ?? undefined,
        propertyId: DEMO_IDS.propertyId,
      },
    });
  } catch (error) {
    console.error("Error al crear notificación", error);
    throw error;
  }
  revalidatePath(DEMO_PATH);
}

export async function generateInvoices(formData: FormData) {
  const month = String(formData.get("month") ?? "");
  const summary = String(formData.get("summary") ?? "").trim();

  if (!month) {
    throw new Error("Selecciona un mes para generar las cuotas");
  }

  const { start, end } = getMonthDateRange(month);
  const property = await prisma.property.findUnique({
    where: { id: DEMO_IDS.propertyId },
    include: { units: true },
  });

  if (!property) throw new Error("Propiedad demo no encontrada");

  const transactions = await prisma.transaction.findMany({
    where: {
      propertyId: DEMO_IDS.propertyId,
      occurredAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const totals = transactions.reduce(
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

  const totalToDistribute = Math.max(totals.expense - totals.income, 0);
  const totalCoefficient = property.units.reduce((acc, unit) => acc + Number(unit.coefficient), 0);

  await Promise.all(
    property.units.map((unit) => {
      const share = totalCoefficient
        ? (totalToDistribute * Number(unit.coefficient)) / totalCoefficient
        : 0;
      const amountDue = new Prisma.Decimal(share.toFixed(2));

      return prisma.invoice.upsert({
        where: {
          unitId_period: {
            unitId: unit.id,
            period: start,
          },
        },
        update: {
          amountDue,
          summary: summary || `Cuota mensual ${format(start, "MMMM yyyy", { locale: es })}`,
          status: "PENDING",
          amountPaid: new Prisma.Decimal(0),
        },
        create: {
          period: start,
          amountDue,
          amountPaid: new Prisma.Decimal(0),
          status: "PENDING",
          summary: summary || `Cuota mensual ${format(start, "MMMM yyyy", { locale: es })}`,
          propertyId: DEMO_IDS.propertyId,
          unitId: unit.id,
        },
      });
    })
  );

  revalidatePath(DEMO_PATH);
}

export async function markInvoiceAsPaid(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") ?? "");

  if (!invoiceId) return;

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "PAID",
      amountPaid: invoice.amountDue,
    },
  });
  revalidatePath(DEMO_PATH);
}

export async function reopenInvoice(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") ?? "");

  if (!invoiceId) return;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "PENDING",
      amountPaid: new Prisma.Decimal(0),
    },
  });
  revalidatePath(DEMO_PATH);
}
