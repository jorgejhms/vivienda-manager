import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { addDays, addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";

const DEMO_PROPERTY_ID = "prop_demo";

export async function ensureDemoData() {
  const property = await prisma.property.findUnique({
    where: { id: DEMO_PROPERTY_ID },
  });

  if (property) {
    return property;
  }

  const now = new Date();
  const lastMonth = subMonths(now, 1);
  const nextMonth = addMonths(now, 1);

  await prisma.property.create({
    data: {
      id: DEMO_PROPERTY_ID,
      name: "Residencial Horizonte",
      address: "Av. Siempre Viva 742, Miraflores",
      currency: "PEN",
    },
  });

  await prisma.unit.createMany({
    data: [
      { id: "unit_a101", label: "A-101", coefficient: "1.1", propertyId: DEMO_PROPERTY_ID },
      { id: "unit_a102", label: "A-102", coefficient: "0.9", propertyId: DEMO_PROPERTY_ID },
      { id: "unit_b201", label: "B-201", coefficient: "1", propertyId: DEMO_PROPERTY_ID },
      { id: "unit_b202", label: "B-202", coefficient: "1", propertyId: DEMO_PROPERTY_ID },
    ],
    skipDuplicates: true,
  });

  await prisma.document.createMany({
    data: [
      {
        id: "doc_reglamento",
        title: "Reglamento Interno 2024",
        url: "https://example.org/reglamento.pdf",
        category: "REGULATION",
        description: "Versión aprobada en la asamblea de marzo.",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "doc_estatutos",
        title: "Estatutos de la Junta",
        url: "https://example.org/estatutos.pdf",
        category: "STATUTE",
        description: "Documento marco con firmas digitalizadas.",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "doc_acta_abril",
        title: "Acta Asamblea Abril 2024",
        url: "https://example.org/acta-abril.pdf",
        category: "MINUTE",
        description: "Resumen de acuerdos sobre mantenimiento y seguridad.",
        propertyId: DEMO_PROPERTY_ID,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.announcement.createMany({
    data: [
      {
        id: "announcement_mantenimiento",
        title: "Mantenimiento de ascensores",
        content:
          "Recordamos que el jueves se realizará el mantenimiento trimestral. Favor evitar uso entre 09:00 y 12:00.",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "announcement_aniversario",
        title: "Aniversario del edificio",
        content: "El sábado tendremos un compartir en la terraza desde las 6 p.m. ¡Todos invitados!",
        propertyId: DEMO_PROPERTY_ID,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.event.createMany({
    data: [
      {
        id: "event_asamblea",
        title: "Asamblea extraordinaria",
        description: "Revisión de presupuesto y nuevas reglas de convivencia.",
        startsAt: addDays(startOfMonth(now), 10),
        endsAt: addDays(startOfMonth(now), 10),
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "event_mantenimiento",
        title: "Desinfección de cisternas",
        description: "Servicio programado para zonas comunes.",
        startsAt: addDays(startOfMonth(nextMonth), 4),
        endsAt: addDays(startOfMonth(nextMonth), 4),
        recurring: true,
        propertyId: DEMO_PROPERTY_ID,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.transaction.createMany({
    data: [
      {
        id: "tx_cuotas_marzo",
        amount: new Prisma.Decimal(5200),
        occurredAt: startOfMonth(lastMonth),
        description: "Cuotas cobradas marzo",
        type: "INCOME",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "tx_guardiania",
        amount: new Prisma.Decimal(1800),
        occurredAt: startOfMonth(lastMonth),
        description: "Servicio de guardianía",
        type: "EXPENSE_FIXED",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "tx_limpieza",
        amount: new Prisma.Decimal(1250),
        occurredAt: startOfMonth(now),
        description: "Proveedor de limpieza",
        type: "EXPENSE_VARIABLE",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "tx_pintura",
        amount: new Prisma.Decimal(2300),
        occurredAt: startOfMonth(now),
        description: "Pintado de lobby",
        type: "EXPENSE_VARIABLE",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "tx_cuotas_abril",
        amount: new Prisma.Decimal(5400),
        occurredAt: startOfMonth(now),
        description: "Cobro de cuotas abril",
        type: "INCOME",
        propertyId: DEMO_PROPERTY_ID,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        id: "inv_camaras",
        name: "Sistema de cámaras",
        category: "Seguridad",
        purchaseDate: subMonths(now, 8),
        value: new Prisma.Decimal(8500),
        condition: "Operativo",
        notes: "Contrato de mantenimiento anual con SafeTech.",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "inv_extintores",
        name: "Extintores ABC",
        category: "Seguridad",
        purchaseDate: subMonths(now, 3),
        value: new Prisma.Decimal(1200),
        condition: "Requiere recarga trimestral",
        notes: "Proveedor: FirePlus. Próxima inspección en junio.",
        propertyId: DEMO_PROPERTY_ID,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      {
        id: "notif_agua",
        subject: "Corte programado de agua",
        message: "Sedapal interrumpirá el servicio el martes de 10 a 13h.",
        channel: "EMAIL",
        propertyId: DEMO_PROPERTY_ID,
      },
      {
        id: "notif_recibo",
        subject: "Recibo pendiente",
        message: "Tu departamento registra saldo pendiente del mes anterior.",
        audience: "ADMINS",
        channel: "IN_APP",
        propertyId: DEMO_PROPERTY_ID,
      },
    ],
    skipDuplicates: true,
  });

  await Promise.all([
    prisma.invoice.create({
      data: {
        id: "invoice_a101",
        period: startOfMonth(lastMonth),
        amountDue: new Prisma.Decimal(650),
        amountPaid: new Prisma.Decimal(650),
        status: "PAID",
        summary: "Cuota ordinaria marzo",
        propertyId: DEMO_PROPERTY_ID,
        unitId: "unit_a101",
      },
    }),
    prisma.invoice.create({
      data: {
        id: "invoice_a102",
        period: startOfMonth(lastMonth),
        amountDue: new Prisma.Decimal(650),
        amountPaid: new Prisma.Decimal(0),
        status: "PENDING",
        summary: "Cuota ordinaria marzo",
        propertyId: DEMO_PROPERTY_ID,
        unitId: "unit_a102",
      },
    }),
    prisma.invoice.create({
      data: {
        id: "invoice_b201",
        period: startOfMonth(lastMonth),
        amountDue: new Prisma.Decimal(650),
        amountPaid: new Prisma.Decimal(300),
        status: "PARTIALLY_PAID",
        summary: "Cuota ordinaria marzo",
        propertyId: DEMO_PROPERTY_ID,
        unitId: "unit_b201",
      },
    }),
  ]);

  return prisma.property.findUniqueOrThrow({
    where: { id: DEMO_PROPERTY_ID },
  });
}

export const DEMO_IDS = {
  propertyId: DEMO_PROPERTY_ID,
};

export function getMonthDateRange(input: string) {
  const [year, month] = input.split("-").map(Number);
  const baseDate = new Date(year, month - 1, 1);
  return {
    start: startOfMonth(baseDate),
    end: endOfMonth(baseDate),
  };
}
