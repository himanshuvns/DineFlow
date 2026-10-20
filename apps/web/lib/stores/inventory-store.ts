"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api";

// ── Types & Interfaces ────────────────────────────────────────────────────────

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "expiring_soon";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  maxStock: number;
  baseUnit: string;        // e.g. "g", "ml", "pcs"
  purchaseUnit: string;    // e.g. "kg", "Box", "Crate", "L"
  conversionFactor: number;// e.g. 1 Box = 1000 g
  averageCost: number;     // ₹ cost per base unit
  purchaseCost: number;    // ₹ cost per purchase unit
  storageLocation: string; // e.g. "Dry Storage Shelf A", "Walk-in Freezer", "Bar Cellar"
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  trackExpiry: boolean;
  trackBatches: boolean;
  shelfLifeDays?: number;
  outletId?: string;
  status: StockStatus;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  address: string;
  paymentTerms: "Immediate / COD" | "Net 7" | "Net 15" | "Net 30" | "Net 60";
  categories: string[];
  totalSpend: number;
  activeOrders: number;
  rating: number; // 1 to 5
  status: "active" | "inactive";
  leadTimeDays: number;
  notes?: string;
}

export type PurchaseOrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled";

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  sku: string;
  purchaseUnit: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxTotal: number;
  shippingCost: number;
  grandTotal: number;
  notes?: string;
  deliveryLocation: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface GrnLineItem {
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  rejectedQty: number;
  rejectionReason?: string;
  unitCost: number;
  batchNumber: string;
  mfgDate?: string;
  expiryDate?: string;
  storageLocation: string;
  totalCost: number;
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  poId?: string;
  poNumber?: string;
  supplierName: string;
  receivedDate: string;
  receivedBy: string;
  items: GrnLineItem[];
  grandTotal: number;
  notes?: string;
  status: "verified" | "discrepancy";
}

export interface RecipeIngredient {
  itemId: string;
  itemName: string;
  quantity: number;        // in base unit
  unit: string;            // base unit, e.g. "g"
  unitCost: number;        // ₹ per base unit
  yieldLossPercent: number;// e.g. 5%
  totalCost: number;       // (quantity * unitCost) / (1 - yieldLoss% / 100)
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  category: string;
  portionSize: number;     // portions per batch
  yieldPercent: number;    // %
  ingredients: RecipeIngredient[];
  totalCostPerServing: number;
  sellingPrice: number;
  foodCostPercent: number; // (cost / selling) * 100
  grossMarginPercent: number; // 100 - foodCost%
  status: "configured" | "missing_bom";
  lastUpdated: string;
  notes?: string;
}

export type StockMovementType =
  | "consumption"
  | "receipt"
  | "wastage"
  | "transfer"
  | "adjustment";

export interface StockMovement {
  id: string;
  movementDate: string;
  itemId: string;
  itemName: string;
  sku: string;
  type: StockMovementType;
  deltaQty: number;        // positive for receipt/adjustment-in, negative for consumption/wastage
  unit: string;
  previousBalance: number;
  newBalance: number;
  unitCost: number;
  totalCost: number;
  referenceType: "POS_ORDER" | "GRN" | "TRANSFER" | "MANUAL_ADJUST" | "COUNT_RECONCILE";
  referenceNumber: string; // e.g. "ORD-9421", "GRN-104", "ADJ-008"
  storageLocation: string;
  reason: string;
  actorName: string;
  actorRole: string;
}

export interface StockCountItem {
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  systemQty: number;
  countedQty: number;
  varianceQty: number;
  unitCost: number;
  varianceValue: number;
  notes?: string;
}

export interface StockCount {
  id: string;
  countNumber: string;
  title: string;
  status: "draft" | "in_progress" | "completed" | "approved";
  category: string;
  storageLocation: string;
  countDate: string;
  countedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  items: StockCountItem[];
  totalVarianceValue: number;
  notes?: string;
}

export interface TransferItem {
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  requestedQty: number;
  dispatchedQty: number;
  receivedQty: number;
  damagedQty: number;
  discrepancyNotes?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceOutlet: string;
  destinationOutlet: string;
  status: "draft" | "in_transit" | "completed" | "cancelled";
  transferDate: string;
  requestedBy: string;
  dispatchedBy?: string;
  receivedBy?: string;
  items: TransferItem[];
  notes?: string;
}

export interface InventorySettings {
  deductionTrigger: "on_order_preparing" | "on_order_paid";
  negativeStockPolicy: "allow_with_warning" | "strictly_block";
  strictStockEnforcement: boolean;
  lowStockAlertThresholdDays: number;
  expiryAlertDays: number;
  enableHotelDepartmentBilling: boolean;
  defaultStorageLocation: string;
  autoGeneratePoOnLowStock: boolean;
}

export interface InventoryFilters {
  category: string;
  stockStatus: string;
  outlet: string;
  search: string;
  dateRange: string;
}

export interface DashboardMetrics {
  totalItems: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  pendingPOCount: number;
  pendingPOValue: number;
  monthlyReceivedValue: number;
  monthlyConsumedValue: number;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const SEED_ITEMS: InventoryItem[] = [
  {
    id: "inv-itm-1",
    name: "Arborio Rice",
    sku: "DRY-ARB-01",
    barcode: "890123456781",
    category: "Dry Pantry",
    currentStock: 25000,
    minStock: 10000,
    reorderPoint: 15000,
    maxStock: 50000,
    baseUnit: "g",
    purchaseUnit: "kg",
    conversionFactor: 1000,
    averageCost: 0.22,
    purchaseCost: 220,
    storageLocation: "Dry Storage Rack A-2",
    preferredSupplierId: "sup-3",
    preferredSupplierName: "La Spiga Italian Imports",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 365,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-2",
    name: "Black Truffle Paste",
    sku: "DRY-TRF-02",
    barcode: "890123456782",
    category: "Dry Pantry",
    currentStock: 650,
    minStock: 500,
    reorderPoint: 1000,
    maxStock: 3000,
    baseUnit: "g",
    purchaseUnit: "Jar (500g)",
    conversionFactor: 500,
    averageCost: 4.80,
    purchaseCost: 2400,
    storageLocation: "Chef Special Lockers",
    preferredSupplierId: "sup-3",
    preferredSupplierName: "La Spiga Italian Imports",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 180,
    status: "low_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-3",
    name: "Buffalo Mozzarella",
    sku: "DAI-MOZ-03",
    barcode: "890123456783",
    category: "Dairy",
    currentStock: 3500,
    minStock: 3000,
    reorderPoint: 5000,
    maxStock: 15000,
    baseUnit: "g",
    purchaseUnit: "Tub (1kg)",
    conversionFactor: 1000,
    averageCost: 0.75,
    purchaseCost: 750,
    storageLocation: "Walk-in Cooler Shelf 1",
    preferredSupplierId: "sup-2",
    preferredSupplierName: "Himalayan Organic Dairy",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 14,
    status: "low_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-4",
    name: "San Marzano Whole Tomatoes",
    sku: "PRD-TOM-04",
    barcode: "890123456784",
    category: "Produce",
    currentStock: 42000,
    minStock: 12000,
    reorderPoint: 20000,
    maxStock: 60000,
    baseUnit: "g",
    purchaseUnit: "Can (2.5kg)",
    conversionFactor: 2500,
    averageCost: 0.28,
    purchaseCost: 700,
    storageLocation: "Dry Storage Rack B-1",
    preferredSupplierId: "sup-1",
    preferredSupplierName: "Apex Agro Fresh",
    trackExpiry: true,
    trackBatches: false,
    shelfLifeDays: 730,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-5",
    name: "Extra Virgin Olive Oil",
    sku: "OIL-EVO-05",
    barcode: "890123456785",
    category: "Dry Pantry",
    currentStock: 18500,
    minStock: 8000,
    reorderPoint: 12000,
    maxStock: 40000,
    baseUnit: "ml",
    purchaseUnit: "Tin (5L)",
    conversionFactor: 5000,
    averageCost: 0.85,
    purchaseCost: 4250,
    storageLocation: "Dry Storage Rack A-1",
    preferredSupplierId: "sup-3",
    preferredSupplierName: "La Spiga Italian Imports",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 540,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-6",
    name: "Unsalted Butter 82%",
    sku: "DAI-BUT-06",
    barcode: "890123456786",
    category: "Dairy",
    currentStock: 14200,
    minStock: 5000,
    reorderPoint: 8000,
    maxStock: 30000,
    baseUnit: "g",
    purchaseUnit: "Block (500g)",
    conversionFactor: 500,
    averageCost: 0.52,
    purchaseCost: 260,
    storageLocation: "Walk-in Cooler Shelf 2",
    preferredSupplierId: "sup-2",
    preferredSupplierName: "Himalayan Organic Dairy",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 90,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-7",
    name: "Boneless Chicken Breast",
    sku: "MET-CHK-07",
    barcode: "890123456787",
    category: "Meat & Poultry",
    currentStock: 22000,
    minStock: 8000,
    reorderPoint: 12000,
    maxStock: 40000,
    baseUnit: "g",
    purchaseUnit: "kg",
    conversionFactor: 1000,
    averageCost: 0.32,
    purchaseCost: 320,
    storageLocation: "Meat Freezer Bay 1",
    preferredSupplierId: "sup-4",
    preferredSupplierName: "Coastal Fresh Catch & Farms",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 5,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-8",
    name: "Organic Malai Paneer",
    sku: "DAI-PAN-08",
    barcode: "890123456788",
    category: "Dairy",
    currentStock: 16000,
    minStock: 6000,
    reorderPoint: 10000,
    maxStock: 25000,
    baseUnit: "g",
    purchaseUnit: "Block (1kg)",
    conversionFactor: 1000,
    averageCost: 0.36,
    purchaseCost: 360,
    storageLocation: "Dairy Chiller Rack 1",
    preferredSupplierId: "sup-2",
    preferredSupplierName: "Himalayan Organic Dairy",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 7,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-9",
    name: "Heavy Whipping Cream 35%",
    sku: "DAI-CRM-09",
    barcode: "890123456789",
    category: "Dairy",
    currentStock: 4500,
    minStock: 4000,
    reorderPoint: 8000,
    maxStock: 20000,
    baseUnit: "ml",
    purchaseUnit: "Tetra (1L)",
    conversionFactor: 1000,
    averageCost: 0.24,
    purchaseCost: 240,
    storageLocation: "Walk-in Cooler Shelf 2",
    preferredSupplierId: "sup-2",
    preferredSupplierName: "Himalayan Organic Dairy",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 60,
    status: "low_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-10",
    name: "Single Origin Espresso Beans",
    sku: "BEV-ESP-10",
    barcode: "890123456790",
    category: "Beverages",
    currentStock: 12000,
    minStock: 4000,
    reorderPoint: 6000,
    maxStock: 25000,
    baseUnit: "g",
    purchaseUnit: "Bag (1kg)",
    conversionFactor: 1000,
    averageCost: 1.40,
    purchaseCost: 1400,
    storageLocation: "Bar Storage Shelf 3",
    preferredSupplierId: "sup-1",
    preferredSupplierName: "Apex Agro Fresh",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 180,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-11",
    name: "Fresh Mint Sprigs",
    sku: "PRD-MNT-11",
    barcode: "890123456791",
    category: "Produce",
    currentStock: 350,
    minStock: 300,
    reorderPoint: 800,
    maxStock: 2500,
    baseUnit: "g",
    purchaseUnit: "Bunch (250g)",
    conversionFactor: 250,
    averageCost: 0.16,
    purchaseCost: 40,
    storageLocation: "Herb Chiller Bin A",
    preferredSupplierId: "sup-1",
    preferredSupplierName: "Apex Agro Fresh",
    trackExpiry: true,
    trackBatches: false,
    shelfLifeDays: 4,
    status: "low_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-12",
    name: "Fine Almond Flour",
    sku: "BAK-ALM-12",
    barcode: "890123456792",
    category: "Bakery",
    currentStock: 0,
    minStock: 3000,
    reorderPoint: 5000,
    maxStock: 15000,
    baseUnit: "g",
    purchaseUnit: "Bag (1kg)",
    conversionFactor: 1000,
    averageCost: 0.95,
    purchaseCost: 950,
    storageLocation: "Bakery Dry Shelf 2",
    preferredSupplierId: "sup-3",
    preferredSupplierName: "La Spiga Italian Imports",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 180,
    status: "out_of_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-13",
    name: "Belgian Dark Callets 70%",
    sku: "BAK-CHOC-13",
    barcode: "890123456793",
    category: "Bakery",
    currentStock: 14000,
    minStock: 5000,
    reorderPoint: 8000,
    maxStock: 25000,
    baseUnit: "g",
    purchaseUnit: "Bag (2.5kg)",
    conversionFactor: 2500,
    averageCost: 1.10,
    purchaseCost: 2750,
    storageLocation: "Pastry Controlled Room",
    preferredSupplierId: "sup-3",
    preferredSupplierName: "La Spiga Italian Imports",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 365,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-14",
    name: "Atlantic Salmon Fillet",
    sku: "SEA-SAL-14",
    barcode: "890123456794",
    category: "Meat & Poultry",
    currentStock: 5200,
    minStock: 4000,
    reorderPoint: 6000,
    maxStock: 15000,
    baseUnit: "g",
    purchaseUnit: "Side (1.5kg)",
    conversionFactor: 1500,
    averageCost: 1.85,
    purchaseCost: 2775,
    storageLocation: "Fish Chiller Shelf A",
    preferredSupplierId: "sup-4",
    preferredSupplierName: "Coastal Fresh Catch & Farms",
    trackExpiry: true,
    trackBatches: true,
    shelfLifeDays: 3,
    status: "expiring_soon",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-itm-15",
    name: "Biodegradable Meal Bowls 750ml",
    sku: "PKG-BWL-15",
    barcode: "890123456795",
    category: "Packaging",
    currentStock: 850,
    minStock: 200,
    reorderPoint: 400,
    maxStock: 2000,
    baseUnit: "pcs",
    purchaseUnit: "Carton (100 pcs)",
    conversionFactor: 100,
    averageCost: 6.50,
    purchaseCost: 650,
    storageLocation: "Packaging Store Bin 4",
    preferredSupplierId: "sup-5",
    preferredSupplierName: "EcoPack Sustainable Solutions",
    trackExpiry: false,
    trackBatches: false,
    status: "in_stock",
    updatedAt: new Date().toISOString(),
  },
];

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Apex Agro Fresh",
    contactPerson: "Rajesh Sharma",
    email: "procurement@apexagro.in",
    phone: "+91 98201 54321",
    gstin: "27AABCU9603R1ZM",
    address: "Plot 42, Vashi APMC Market, Navi Mumbai 400703",
    paymentTerms: "Net 15",
    categories: ["Produce", "Beverages"],
    totalSpend: 148500,
    activeOrders: 2,
    rating: 4.8,
    status: "active",
    leadTimeDays: 1,
    notes: "Primary daily produce vendor. Reliable early morning dispatch by 6:00 AM.",
  },
  {
    id: "sup-2",
    name: "Himalayan Organic Dairy",
    contactPerson: "Sunil Verma",
    email: "orders@himalayandairy.com",
    phone: "+91 98110 98765",
    gstin: "07AAACR4021K1ZN",
    address: "Industrial Area Phase II, Okhla, New Delhi 110020",
    paymentTerms: "Net 7",
    categories: ["Dairy"],
    totalSpend: 218400,
    activeOrders: 1,
    rating: 4.9,
    status: "active",
    leadTimeDays: 2,
    notes: "FSSAI Grade A certified organic milk, butter, and artisanal malai paneer.",
  },
  {
    id: "sup-3",
    name: "La Spiga Italian Imports",
    contactPerson: "Marco Bianchi",
    email: "india@laspiga-imports.com",
    phone: "+91 98450 11223",
    gstin: "29AABCL5544E1ZY",
    address: "Koramangala 4th Block, Bengaluru 560034",
    paymentTerms: "Net 30",
    categories: ["Dry Pantry", "Bakery"],
    totalSpend: 312000,
    activeOrders: 1,
    rating: 4.7,
    status: "active",
    leadTimeDays: 4,
    notes: "Exclusive importer for San Marzano, truffle paste, Arborio, and Callebaut chocolate.",
  },
  {
    id: "sup-4",
    name: "Coastal Fresh Catch & Farms",
    contactPerson: "Kiran Patil",
    email: "supply@coastalfresh.in",
    phone: "+91 97690 33445",
    gstin: "27AAECK1290M1Z3",
    address: "Sassoon Dock, Colaba, Mumbai 400005",
    paymentTerms: "Immediate / COD",
    categories: ["Meat & Poultry"],
    totalSpend: 184500,
    activeOrders: 1,
    rating: 4.6,
    status: "active",
    leadTimeDays: 1,
    notes: "Daily temperature-monitored refrigerated reefers.",
  },
  {
    id: "sup-5",
    name: "EcoPack Sustainable Solutions",
    contactPerson: "Ananya Iyer",
    email: "sales@ecopack.co.in",
    phone: "+91 99200 44556",
    gstin: "33AABCE8821L1ZR",
    address: "Ambattur Industrial Estate, Chennai 600058",
    paymentTerms: "Net 30",
    categories: ["Packaging"],
    totalSpend: 62000,
    activeOrders: 0,
    rating: 4.5,
    status: "active",
    leadTimeDays: 3,
    notes: "Compostable sugarcane bagasse containers and eco paper cutlery.",
  },
];

const SEED_POS: PurchaseOrder[] = [
  {
    id: "po-101",
    poNumber: "PO-2026-0041",
    supplierId: "sup-3",
    supplierName: "La Spiga Italian Imports",
    orderDate: "2026-10-18T10:00:00Z",
    expectedDeliveryDate: "2026-10-22T14:00:00Z",
    status: "ordered",
    items: [
      {
        itemId: "inv-itm-2",
        itemName: "Black Truffle Paste",
        sku: "DRY-TRF-02",
        purchaseUnit: "Jar (500g)",
        quantity: 4,
        unitPrice: 2400,
        taxPercent: 12,
        total: 10752,
      },
      {
        itemId: "inv-itm-12",
        itemName: "Fine Almond Flour",
        sku: "BAK-ALM-12",
        purchaseUnit: "Bag (1kg)",
        quantity: 10,
        unitPrice: 950,
        taxPercent: 5,
        total: 9975,
      },
    ],
    subtotal: 19100,
    taxTotal: 1627,
    shippingCost: 350,
    grandTotal: 21077,
    notes: "Urgent shipment for weekend tasting menu.",
    deliveryLocation: "Central Receiving Bay",
    approvedBy: "Chef Vikram (Executive Chef)",
    approvedAt: "2026-10-18T11:15:00Z",
    createdAt: "2026-10-18T10:00:00Z",
  },
  {
    id: "po-102",
    poNumber: "PO-2026-0042",
    supplierId: "sup-2",
    supplierName: "Himalayan Organic Dairy",
    orderDate: "2026-10-19T09:30:00Z",
    expectedDeliveryDate: "2026-10-21T08:00:00Z",
    status: "pending_approval",
    items: [
      {
        itemId: "inv-itm-3",
        itemName: "Buffalo Mozzarella",
        sku: "DAI-MOZ-03",
        purchaseUnit: "Tub (1kg)",
        quantity: 10,
        unitPrice: 750,
        taxPercent: 5,
        total: 7875,
      },
      {
        itemId: "inv-itm-9",
        itemName: "Heavy Whipping Cream 35%",
        sku: "DAI-CRM-09",
        purchaseUnit: "Tetra (1L)",
        quantity: 15,
        unitPrice: 240,
        taxPercent: 5,
        total: 3780,
      },
    ],
    subtotal: 11100,
    taxTotal: 555,
    shippingCost: 0,
    grandTotal: 11655,
    notes: "Requires cold chain loggers upon handover.",
    deliveryLocation: "Cold Room 1",
    createdAt: "2026-10-19T09:30:00Z",
  },
  {
    id: "po-103",
    poNumber: "PO-2026-0040",
    supplierId: "sup-1",
    supplierName: "Apex Agro Fresh",
    orderDate: "2026-10-15T08:00:00Z",
    expectedDeliveryDate: "2026-10-16T07:00:00Z",
    status: "received",
    items: [
      {
        itemId: "inv-itm-4",
        itemName: "San Marzano Whole Tomatoes",
        sku: "PRD-TOM-04",
        purchaseUnit: "Can (2.5kg)",
        quantity: 12,
        unitPrice: 700,
        taxPercent: 5,
        total: 8820,
      },
    ],
    subtotal: 8400,
    taxTotal: 420,
    shippingCost: 150,
    grandTotal: 8970,
    deliveryLocation: "Central Receiving Bay",
    approvedBy: "Priya (Operations Lead)",
    approvedAt: "2026-10-15T08:30:00Z",
    createdAt: "2026-10-15T08:00:00Z",
  },
];

const SEED_GRNS: GoodsReceivedNote[] = [
  {
    id: "grn-201",
    grnNumber: "GRN-2026-0038",
    poId: "po-103",
    poNumber: "PO-2026-0040",
    supplierName: "Apex Agro Fresh",
    receivedDate: "2026-10-16T07:30:00Z",
    receivedBy: "Chef Vikram",
    status: "verified",
    items: [
      {
        itemId: "inv-itm-4",
        itemName: "San Marzano Whole Tomatoes",
        sku: "PRD-TOM-04",
        unit: "Can (2.5kg)",
        orderedQty: 12,
        receivedQty: 12,
        rejectedQty: 0,
        unitCost: 700,
        batchNumber: "LOT-TOM-2610",
        mfgDate: "2026-08-10",
        expiryDate: "2028-08-10",
        storageLocation: "Dry Storage Rack B-1",
        totalCost: 8400,
      },
    ],
    grandTotal: 8820,
    notes: "All 12 cans sealed without dents. Batch recorded.",
  },
];

const SEED_RECIPES: Recipe[] = [
  {
    id: "rcp-1",
    menuItemId: "itm_b1",
    menuItemName: "Truffle Mushroom Risotto",
    category: "Mains",
    portionSize: 1,
    yieldPercent: 96,
    ingredients: [
      {
        itemId: "inv-itm-1",
        itemName: "Arborio Rice",
        quantity: 120, // 120g
        unit: "g",
        unitCost: 0.22,
        yieldLossPercent: 2,
        totalCost: 26.94,
      },
      {
        itemId: "inv-itm-2",
        itemName: "Black Truffle Paste",
        quantity: 18, // 18g
        unit: "g",
        unitCost: 4.80,
        yieldLossPercent: 1,
        totalCost: 87.27,
      },
      {
        itemId: "inv-itm-6",
        itemName: "Unsalted Butter 82%",
        quantity: 35, // 35g
        unit: "g",
        unitCost: 0.52,
        yieldLossPercent: 3,
        totalCost: 18.76,
      },
      {
        itemId: "inv-itm-5",
        itemName: "Extra Virgin Olive Oil",
        quantity: 15, // 15ml
        unit: "ml",
        unitCost: 0.85,
        yieldLossPercent: 1,
        totalCost: 12.88,
      },
    ],
    totalCostPerServing: 145.85,
    sellingPrice: 850,
    foodCostPercent: 17.16,
    grossMarginPercent: 82.84,
    status: "configured",
    lastUpdated: "2026-10-17T12:00:00Z",
    notes: "High margin signature Italian dish. Strict portioning on truffle paste.",
  },
  {
    id: "rcp-2",
    menuItemId: "itm_b2",
    menuItemName: "Wood-Fired Margherita",
    category: "Pizzas",
    portionSize: 1,
    yieldPercent: 98,
    ingredients: [
      {
        itemId: "inv-itm-4",
        itemName: "San Marzano Whole Tomatoes",
        quantity: 110,
        unit: "g",
        unitCost: 0.28,
        yieldLossPercent: 5,
        totalCost: 32.42,
      },
      {
        itemId: "inv-itm-3",
        itemName: "Buffalo Mozzarella",
        quantity: 125,
        unit: "g",
        unitCost: 0.75,
        yieldLossPercent: 2,
        totalCost: 95.66,
      },
      {
        itemId: "inv-itm-5",
        itemName: "Extra Virgin Olive Oil",
        quantity: 10,
        unit: "ml",
        unitCost: 0.85,
        yieldLossPercent: 1,
        totalCost: 8.59,
      },
    ],
    totalCostPerServing: 136.67,
    sellingPrice: 750,
    foodCostPercent: 18.22,
    grossMarginPercent: 81.78,
    status: "configured",
    lastUpdated: "2026-10-18T14:30:00Z",
    notes: "Wood oven deck temperature 430°C. 90-second flash bake.",
  },
  {
    id: "rcp-3",
    menuItemId: "itm_b3",
    menuItemName: "Butter Chicken Supreme",
    category: "Mains",
    portionSize: 1,
    yieldPercent: 94,
    ingredients: [
      {
        itemId: "inv-itm-7",
        itemName: "Boneless Chicken Breast",
        quantity: 260,
        unit: "g",
        unitCost: 0.32,
        yieldLossPercent: 8,
        totalCost: 90.43,
      },
      {
        itemId: "inv-itm-6",
        itemName: "Unsalted Butter 82%",
        quantity: 45,
        unit: "g",
        unitCost: 0.52,
        yieldLossPercent: 2,
        totalCost: 23.88,
      },
      {
        itemId: "inv-itm-9",
        itemName: "Heavy Whipping Cream 35%",
        quantity: 60,
        unit: "ml",
        unitCost: 0.24,
        yieldLossPercent: 2,
        totalCost: 14.69,
      },
      {
        itemId: "inv-itm-4",
        itemName: "San Marzano Whole Tomatoes",
        quantity: 140,
        unit: "g",
        unitCost: 0.28,
        yieldLossPercent: 4,
        totalCost: 40.83,
      },
    ],
    totalCostPerServing: 169.83,
    sellingPrice: 620,
    foodCostPercent: 27.39,
    grossMarginPercent: 72.61,
    status: "configured",
    lastUpdated: "2026-10-19T11:00:00Z",
    notes: "Slow-simmered tomato makhani base with tandoor char.",
  },
  {
    id: "rcp-4",
    menuItemId: "itm_b4",
    menuItemName: "Paneer Tikka Shashlik",
    category: "Starters",
    portionSize: 1,
    yieldPercent: 95,
    ingredients: [
      {
        itemId: "inv-itm-8",
        itemName: "Organic Malai Paneer",
        quantity: 220,
        unit: "g",
        unitCost: 0.36,
        yieldLossPercent: 4,
        totalCost: 82.50,
      },
      {
        itemId: "inv-itm-6",
        itemName: "Unsalted Butter 82%",
        quantity: 20,
        unit: "g",
        unitCost: 0.52,
        yieldLossPercent: 2,
        totalCost: 10.61,
      },
      {
        itemId: "inv-itm-11",
        itemName: "Fresh Mint Sprigs",
        quantity: 15,
        unit: "g",
        unitCost: 0.16,
        yieldLossPercent: 10,
        totalCost: 2.67,
      },
    ],
    totalCostPerServing: 95.78,
    sellingPrice: 480,
    foodCostPercent: 19.95,
    grossMarginPercent: 80.05,
    status: "configured",
    lastUpdated: "2026-10-19T15:20:00Z",
    notes: "Marinated with hung curd, degi mirch, and mustard oil.",
  },
  {
    id: "rcp-5",
    menuItemId: "itm_b5",
    menuItemName: "Pan-Seared Norwegian Salmon",
    category: "Mains",
    portionSize: 1,
    yieldPercent: 92,
    ingredients: [
      {
        itemId: "inv-itm-14",
        itemName: "Atlantic Salmon Fillet",
        quantity: 200,
        unit: "g",
        unitCost: 1.85,
        yieldLossPercent: 6,
        totalCost: 393.62,
      },
      {
        itemId: "inv-itm-6",
        itemName: "Unsalted Butter 82%",
        quantity: 30,
        unit: "g",
        unitCost: 0.52,
        yieldLossPercent: 2,
        totalCost: 15.92,
      },
      {
        itemId: "inv-itm-5",
        itemName: "Extra Virgin Olive Oil",
        quantity: 15,
        unit: "ml",
        unitCost: 0.85,
        yieldLossPercent: 1,
        totalCost: 12.88,
      },
    ],
    totalCostPerServing: 422.42,
    sellingPrice: 1150,
    foodCostPercent: 36.73, // Red > 35% warning!
    grossMarginPercent: 63.27,
    status: "configured",
    lastUpdated: "2026-10-20T09:00:00Z",
    notes: "High food cost alert! Premium dish; suggest pairing with high-margin wine.",
  },
  {
    id: "rcp-6",
    menuItemId: "itm_b6",
    menuItemName: "Classic Cold Brew & Tonic",
    category: "Beverages",
    portionSize: 1,
    yieldPercent: 99,
    ingredients: [
      {
        itemId: "inv-itm-10",
        itemName: "Single Origin Espresso Beans",
        quantity: 22,
        unit: "g",
        unitCost: 1.40,
        yieldLossPercent: 1,
        totalCost: 31.11,
      },
      {
        itemId: "inv-itm-11",
        itemName: "Fresh Mint Sprigs",
        quantity: 5,
        unit: "g",
        unitCost: 0.16,
        yieldLossPercent: 5,
        totalCost: 0.84,
      },
    ],
    totalCostPerServing: 31.95,
    sellingPrice: 280,
    foodCostPercent: 11.41,
    grossMarginPercent: 88.59,
    status: "configured",
    lastUpdated: "2026-10-20T10:15:00Z",
  },
  {
    id: "rcp-7",
    menuItemId: "itm_b7",
    menuItemName: "Belgian Molten Lava Cake",
    category: "Desserts",
    portionSize: 1,
    yieldPercent: 95,
    ingredients: [],
    totalCostPerServing: 0,
    sellingPrice: 380,
    foodCostPercent: 0,
    grossMarginPercent: 100,
    status: "missing_bom",
    lastUpdated: "2026-10-20T11:00:00Z",
    notes: "Needs BOM configured with chocolate callets and butter.",
  },
];

const SEED_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-501",
    movementDate: "2026-10-20T21:40:00Z",
    itemId: "inv-itm-1",
    itemName: "Arborio Rice",
    sku: "DRY-ARB-01",
    type: "consumption",
    deltaQty: -1200,
    unit: "g",
    previousBalance: 26200,
    newBalance: 25000,
    unitCost: 0.22,
    totalCost: 264,
    referenceType: "POS_ORDER",
    referenceNumber: "ORD-9428",
    storageLocation: "Dry Storage Rack A-2",
    reason: "10x Truffle Mushroom Risotto prepared on KDS",
    actorName: "Chef Vikram",
    actorRole: "Executive Chef",
  },
  {
    id: "mov-502",
    movementDate: "2026-10-20T20:15:00Z",
    itemId: "inv-itm-3",
    itemName: "Buffalo Mozzarella",
    sku: "DAI-MOZ-03",
    type: "consumption",
    deltaQty: -1500,
    unit: "g",
    previousBalance: 5000,
    newBalance: 3500,
    unitCost: 0.75,
    totalCost: 1125,
    referenceType: "POS_ORDER",
    referenceNumber: "ORD-9419",
    storageLocation: "Walk-in Cooler Shelf 1",
    reason: "12x Margherita Pizzas fired in oven",
    actorName: "Pizzaiolo Matteo",
    actorRole: "Sous Chef",
  },
  {
    id: "mov-503",
    movementDate: "2026-10-20T16:30:00Z",
    itemId: "inv-itm-14",
    itemName: "Atlantic Salmon Fillet",
    sku: "SEA-SAL-14",
    type: "wastage",
    deltaQty: -400,
    unit: "g",
    previousBalance: 5600,
    newBalance: 5200,
    unitCost: 1.85,
    totalCost: 740,
    referenceType: "MANUAL_ADJUST",
    referenceNumber: "WST-2026-089",
    storageLocation: "Fish Chiller Shelf A",
    reason: "Skinning and belly pin-bone trim loss",
    actorName: "Chef Vikram",
    actorRole: "Executive Chef",
  },
  {
    id: "mov-504",
    movementDate: "2026-10-19T14:00:00Z",
    itemId: "inv-itm-10",
    itemName: "Single Origin Espresso Beans",
    sku: "BEV-ESP-10",
    type: "transfer",
    deltaQty: -3000,
    unit: "g",
    previousBalance: 15000,
    newBalance: 12000,
    unitCost: 1.40,
    totalCost: 4200,
    referenceType: "TRANSFER",
    referenceNumber: "TR-2026-0012",
    storageLocation: "Bar Storage Shelf 3",
    reason: "Inter-department transfer to Rooftop Lounge Bar",
    actorName: "Priya",
    actorRole: "Operations Lead",
  },
  {
    id: "mov-505",
    movementDate: "2026-10-16T08:00:00Z",
    itemId: "inv-itm-4",
    itemName: "San Marzano Whole Tomatoes",
    sku: "PRD-TOM-04",
    type: "receipt",
    deltaQty: 30000, // 12 cans x 2500g
    unit: "g",
    previousBalance: 12000,
    newBalance: 42000,
    unitCost: 0.28,
    totalCost: 8400,
    referenceType: "GRN",
    referenceNumber: "GRN-2026-0038",
    storageLocation: "Dry Storage Rack B-1",
    reason: "Delivered against PO-2026-0040",
    actorName: "Chef Vikram",
    actorRole: "Executive Chef",
  },
];

const SEED_COUNTS: StockCount[] = [
  {
    id: "cnt-301",
    countNumber: "AUD-2026-0014",
    title: "Weekly Dairy & Cold Storage Audit",
    status: "completed",
    category: "Dairy",
    storageLocation: "Walk-in Cooler Shelf 1",
    countDate: "2026-10-19T23:00:00Z",
    countedBy: "Chef Vikram",
    approvedBy: "Priya (Operations Lead)",
    approvedAt: "2026-10-20T08:00:00Z",
    totalVarianceValue: -340,
    notes: "Minor shrinkage on block butter. Paneer matched system count 100%.",
    items: [
      {
        itemId: "inv-itm-3",
        itemName: "Buffalo Mozzarella",
        sku: "DAI-MOZ-03",
        unit: "g",
        systemQty: 3600,
        countedQty: 3500,
        varianceQty: -100,
        unitCost: 0.75,
        varianceValue: -75,
        notes: "Slight brine drip drainage loss",
      },
      {
        itemId: "inv-itm-6",
        itemName: "Unsalted Butter 82%",
        sku: "DAI-BUT-06",
        unit: "g",
        systemQty: 14700,
        countedQty: 14200,
        varianceQty: -500,
        unitCost: 0.52,
        varianceValue: -260,
        notes: "Unrecorded prep butter for garlic toast",
      },
      {
        itemId: "inv-itm-8",
        itemName: "Organic Malai Paneer",
        sku: "DAI-PAN-08",
        unit: "g",
        systemQty: 16000,
        countedQty: 16000,
        varianceQty: 0,
        unitCost: 0.36,
        varianceValue: 0,
        notes: "Exact match",
      },
    ],
  },
];

const SEED_TRANSFERS: StockTransfer[] = [
  {
    id: "tr-401",
    transferNumber: "TR-2026-0012",
    sourceOutlet: "Central Commissary / Main Kitchen",
    destinationOutlet: "Rooftop Lounge & Bar",
    status: "completed",
    transferDate: "2026-10-19T14:00:00Z",
    requestedBy: "Bar Manager Sameer",
    dispatchedBy: "Chef Vikram",
    receivedBy: "Bar Manager Sameer",
    notes: "Restock for weekend cocktail festival",
    items: [
      {
        itemId: "inv-itm-10",
        itemName: "Single Origin Espresso Beans",
        sku: "BEV-ESP-10",
        unit: "g",
        requestedQty: 3000,
        dispatchedQty: 3000,
        receivedQty: 3000,
        damagedQty: 0,
      },
      {
        itemId: "inv-itm-11",
        itemName: "Fresh Mint Sprigs",
        sku: "PRD-MNT-11",
        unit: "g",
        requestedQty: 500,
        dispatchedQty: 500,
        receivedQty: 480,
        damagedQty: 20,
        discrepancyNotes: "Minor wilting during sunny transport",
      },
    ],
  },
  {
    id: "tr-402",
    transferNumber: "TR-2026-0013",
    sourceOutlet: "Central Commissary / Main Kitchen",
    destinationOutlet: "In-Room Dining Pantry",
    status: "in_transit",
    transferDate: "2026-10-20T17:00:00Z",
    requestedBy: "Duty Manager Alok",
    dispatchedBy: "Chef Vikram",
    notes: "Midnight guest room service replenishments",
    items: [
      {
        itemId: "inv-itm-15",
        itemName: "Biodegradable Meal Bowls 750ml",
        sku: "PKG-BWL-15",
        unit: "pcs",
        requestedQty: 100,
        dispatchedQty: 100,
        receivedQty: 0,
        damagedQty: 0,
      },
    ],
  },
];

const DEFAULT_SETTINGS: InventorySettings = {
  deductionTrigger: "on_order_preparing",
  negativeStockPolicy: "allow_with_warning",
  strictStockEnforcement: true,
  lowStockAlertThresholdDays: 3,
  expiryAlertDays: 14,
  enableHotelDepartmentBilling: true,
  defaultStorageLocation: "Central Receiving Bay",
  autoGeneratePoOnLowStock: false,
};

// ── Store State Interface ─────────────────────────────────────────────────────

interface InventoryStoreState {
  items: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  grns: GoodsReceivedNote[];
  recipes: Recipe[];
  movements: StockMovement[];
  stockCounts: StockCount[];
  transfers: StockTransfer[];
  settings: InventorySettings;
  filters: InventoryFilters;
  isLoading: boolean;
  error: string | null;

  // Metric Computations
  getMetrics: () => DashboardMetrics;

  // Filtering
  setFilter: <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => void;
  resetFilters: () => void;
  getFilteredItems: () => InventoryItem[];

  // Data Fetching & Sync
  fetchInventory: () => Promise<void>;

  // Item Management
  addItem: (item: Omit<InventoryItem, "id" | "status" | "updatedAt">) => Promise<InventoryItem>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  adjustStock: (params: {
    itemId: string;
    quantityDelta: number;
    reason: "Wastage" | "Correction" | "Damaged" | "Opening Stock" | "Sampling";
    notes?: string;
    actorName: string;
    actorRole: string;
  }) => Promise<void>;

  // Supplier Management
  addSupplier: (supplier: Omit<Supplier, "id" | "totalSpend" | "activeOrders">) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Purchase Order Workflow
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "poNumber" | "status" | "createdAt">) => Promise<PurchaseOrder>;
  approvePurchaseOrder: (id: string, approvedBy: string) => Promise<void>;
  updatePOStatus: (id: string, status: PurchaseOrderStatus) => Promise<void>;

  // GRN / Receiving Workflow
  createGRN: (grn: Omit<GoodsReceivedNote, "id" | "grnNumber">) => Promise<GoodsReceivedNote>;

  // Recipe & BOM Costing
  saveRecipe: (recipe: Omit<Recipe, "id" | "lastUpdated"> & { id?: string }) => Promise<Recipe>;

  // Stock Counts & Audits
  createStockCount: (count: Omit<StockCount, "id" | "countNumber" | "status">) => Promise<StockCount>;
  updateStockCount: (id: string, updates: Partial<StockCount>) => Promise<void>;
  approveStockCount: (id: string, approvedBy: string) => Promise<void>;

  // Multi-Outlet Transfers
  createTransfer: (transfer: Omit<StockTransfer, "id" | "transferNumber" | "status">) => Promise<StockTransfer>;
  completeTransfer: (
    id: string,
    receivedBy: string,
    itemReconciliation: Array<{ itemId: string; receivedQty: number; damagedQty: number; notes?: string }>
  ) => Promise<void>;

  // Settings
  updateSettings: (settings: Partial<InventorySettings>) => Promise<void>;
}

// Helper to determine status from quantities
function calculateItemStatus(stock: number, reorder: number, trackExpiry: boolean, shelfLife?: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= reorder) return "low_stock";
  if (trackExpiry && shelfLife && shelfLife <= 3) return "expiring_soon";
  return "in_stock";
}

// ── Store Implementation ──────────────────────────────────────────────────────

export const useInventoryStore = create<InventoryStoreState>()(
  persist(
    (set, get) => ({
      items: SEED_ITEMS,
      suppliers: SEED_SUPPLIERS,
      purchaseOrders: SEED_POS,
      grns: SEED_GRNS,
      recipes: SEED_RECIPES,
      movements: SEED_MOVEMENTS,
      stockCounts: SEED_COUNTS,
      transfers: SEED_TRANSFERS,
      settings: DEFAULT_SETTINGS,
      filters: {
        category: "all",
        stockStatus: "all",
        outlet: "all",
        search: "",
        dateRange: "this_month",
      },
      isLoading: false,
      error: null,

      getMetrics: () => {
        const { items, purchaseOrders, grns, movements } = get();
        const totalItems = items.length;
        const totalStockValue = items.reduce((sum, item) => sum + item.currentStock * item.averageCost, 0);
        const lowStockCount = items.filter((i) => i.currentStock > 0 && i.currentStock <= i.reorderPoint).length;
        const outOfStockCount = items.filter((i) => i.currentStock <= 0).length;
        const expiringCount = items.filter((i) => i.status === "expiring_soon").length;

        const pendingPOs = purchaseOrders.filter((po) => po.status === "pending_approval" || po.status === "ordered");
        const pendingPOCount = pendingPOs.length;
        const pendingPOValue = pendingPOs.reduce((sum, po) => sum + po.grandTotal, 0);

        const monthlyReceivedValue = grns.reduce((sum, grn) => sum + grn.grandTotal, 0);
        const monthlyConsumedValue = movements
          .filter((m) => m.type === "consumption" || m.type === "wastage")
          .reduce((sum, m) => sum + m.totalCost, 0);

        return {
          totalItems,
          totalStockValue,
          lowStockCount,
          outOfStockCount,
          expiringCount,
          pendingPOCount,
          pendingPOValue,
          monthlyReceivedValue,
          monthlyConsumedValue,
        };
      },

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      resetFilters: () => {
        set({
          filters: {
            category: "all",
            stockStatus: "all",
            outlet: "all",
            search: "",
            dateRange: "this_month",
          },
        });
      },

      getFilteredItems: () => {
        const { items, filters } = get();
        return items.filter((item) => {
          if (filters.category !== "all" && item.category !== filters.category) return false;
          if (filters.stockStatus !== "all" && item.status !== filters.stockStatus) return false;
          if (filters.search) {
            const query = filters.search.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(query);
            const matchesSku = item.sku.toLowerCase().includes(query);
            const matchesLoc = item.storageLocation.toLowerCase().includes(query);
            if (!matchesName && !matchesSku && !matchesLoc) return false;
          }
          return true;
        });
      },

      fetchInventory: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiClient.get("/inventory");
          if (res.data) {
            set({
              items: res.data.items || get().items,
              suppliers: res.data.suppliers || get().suppliers,
              purchaseOrders: res.data.purchaseOrders || get().purchaseOrders,
              grns: res.data.grns || get().grns,
              recipes: res.data.recipes || get().recipes,
              movements: res.data.movements || get().movements,
              stockCounts: res.data.stockCounts || get().stockCounts,
              transfers: res.data.transfers || get().transfers,
              settings: res.data.settings || get().settings,
            });
          }
        } catch {
          // Graceful fallback to client state & seed data
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (itemData) => {
        const status = calculateItemStatus(
          itemData.currentStock,
          itemData.reorderPoint,
          itemData.trackExpiry,
          itemData.shelfLifeDays
        );
        const newItem: InventoryItem = {
          ...itemData,
          id: `inv-${Date.now()}`,
          status,
          updatedAt: new Date().toISOString(),
        };

        try {
          await apiClient.post("/inventory/items", newItem);
        } catch {
          // Optimistic local persistence
        }

        set((state) => ({ items: [newItem, ...state.items] }));
        return newItem;
      },

      updateItem: async (id, updates) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
            updated.status = calculateItemStatus(
              updated.currentStock,
              updated.reorderPoint,
              updated.trackExpiry,
              updated.shelfLifeDays
            );
            return updated;
          }),
        }));

        try {
          await apiClient.put(`/inventory/items/${id}`, updates);
        } catch {}
      },

      deleteItem: async (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
        try {
          await apiClient.delete(`/inventory/items/${id}`);
        } catch {}
      },

      adjustStock: async ({ itemId, quantityDelta, reason, notes, actorName, actorRole }) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        const previousBalance = item.currentStock;
        const newBalance = Math.max(0, previousBalance + quantityDelta);
        const costImpact = Math.abs(quantityDelta * item.averageCost);

        const movementType: StockMovementType =
          reason === "Wastage" || reason === "Damaged"
            ? "wastage"
            : reason === "Sampling"
            ? "consumption"
            : "adjustment";

        const movement: StockMovement = {
          id: `mov-${Date.now()}`,
          movementDate: new Date().toISOString(),
          itemId: item.id,
          itemName: item.name,
          sku: item.sku,
          type: movementType,
          deltaQty: quantityDelta,
          unit: item.baseUnit,
          previousBalance,
          newBalance,
          unitCost: item.averageCost,
          totalCost: costImpact,
          referenceType: "MANUAL_ADJUST",
          referenceNumber: `ADJ-${Date.now().toString().slice(-4)}`,
          storageLocation: item.storageLocation,
          reason: notes || `Manual stock adjustment: ${reason}`,
          actorName,
          actorRole,
        };

        const updatedStatus = calculateItemStatus(
          newBalance,
          item.reorderPoint,
          item.trackExpiry,
          item.shelfLifeDays
        );

        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? { ...i, currentStock: newBalance, status: updatedStatus, updatedAt: new Date().toISOString() }
              : i
          ),
          movements: [movement, ...state.movements],
        }));

        try {
          await apiClient.post("/inventory/adjustments", { itemId, quantityDelta, reason, notes });
        } catch {}
      },

      addSupplier: async (supplierData) => {
        const newSupplier: Supplier = {
          ...supplierData,
          id: `sup-${Date.now()}`,
          totalSpend: 0,
          activeOrders: 0,
        };

        try {
          await apiClient.post("/inventory/suppliers", newSupplier);
        } catch {}

        set((state) => ({ suppliers: [newSupplier, ...state.suppliers] }));
        return newSupplier;
      },

      updateSupplier: async (id, updates) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
        try {
          await apiClient.put(`/inventory/suppliers/${id}`, updates);
        } catch {}
      },

      deleteSupplier: async (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        }));
        try {
          await apiClient.delete(`/inventory/suppliers/${id}`);
        } catch {}
      },

      createPurchaseOrder: async (poData) => {
        const count = get().purchaseOrders.length + 1;
        const newPO: PurchaseOrder = {
          ...poData,
          id: `po-${Date.now()}`,
          poNumber: `PO-${new Date().getFullYear()}-${count.toString().padStart(4, "0")}`,
          status: "pending_approval",
          createdAt: new Date().toISOString(),
        };

        try {
          await apiClient.post("/inventory/purchase-orders", newPO);
        } catch {}

        set((state) => ({
          purchaseOrders: [newPO, ...state.purchaseOrders],
          suppliers: state.suppliers.map((s) =>
            s.id === newPO.supplierId ? { ...s, activeOrders: s.activeOrders + 1 } : s
          ),
        }));
        return newPO;
      },

      approvePurchaseOrder: async (id, approvedBy) => {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id
              ? {
                  ...po,
                  status: "approved",
                  approvedBy,
                  approvedAt: new Date().toISOString(),
                }
              : po
          ),
        }));
        try {
          await apiClient.patch(`/inventory/purchase-orders/${id}/approve`, { approvedBy });
        } catch {}
      },

      updatePOStatus: async (id, status) => {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? { ...po, status } : po)),
        }));
        try {
          await apiClient.patch(`/inventory/purchase-orders/${id}/status`, { status });
        } catch {}
      },

      createGRN: async (grnData) => {
        const count = get().grns.length + 1;
        const newGRN: GoodsReceivedNote = {
          ...grnData,
          id: `grn-${Date.now()}`,
          grnNumber: `GRN-${new Date().getFullYear()}-${count.toString().padStart(4, "0")}`,
        };

        const newMovements: StockMovement[] = [];
        const itemUpdates = new Map<string, number>();

        grnData.items.forEach((line) => {
          if (line.receivedQty > 0) {
            itemUpdates.set(line.itemId, (itemUpdates.get(line.itemId) || 0) + line.receivedQty);
            const currentItem = get().items.find((i) => i.id === line.itemId);
            const prev = currentItem?.currentStock || 0;
            const next = prev + line.receivedQty;

            newMovements.push({
              id: `mov-${Date.now()}-${line.itemId}`,
              movementDate: new Date().toISOString(),
              itemId: line.itemId,
              itemName: line.itemName,
              sku: line.sku,
              type: "receipt",
              deltaQty: line.receivedQty,
              unit: line.unit,
              previousBalance: prev,
              newBalance: next,
              unitCost: line.unitCost,
              totalCost: line.totalCost,
              referenceType: "GRN",
              referenceNumber: newGRN.grnNumber,
              storageLocation: line.storageLocation,
              reason: `Stock receipt from ${newGRN.supplierName}`,
              actorName: newGRN.receivedBy,
              actorRole: "Receiving Inspector",
            });
          }
        });

        set((state) => ({
          grns: [newGRN, ...state.grns],
          movements: [...newMovements, ...state.movements],
          items: state.items.map((item) => {
            const added = itemUpdates.get(item.id);
            if (!added) return item;
            const newStock = item.currentStock + added;
            const newStatus = calculateItemStatus(
              newStock,
              item.reorderPoint,
              item.trackExpiry,
              item.shelfLifeDays
            );
            return {
              ...item,
              currentStock: newStock,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            };
          }),
          // Mark associated PO received if present
          purchaseOrders: state.purchaseOrders.map((po) =>
            newGRN.poId && po.id === newGRN.poId ? { ...po, status: "received" } : po
          ),
        }));

        try {
          await apiClient.post("/inventory/grn", newGRN);
        } catch {}

        return newGRN;
      },

      saveRecipe: async (recipeData) => {
        const id = recipeData.id || `rcp-${Date.now()}`;
        const newRecipe: Recipe = {
          ...recipeData,
          id,
          lastUpdated: new Date().toISOString(),
        };

        set((state) => ({
          recipes: [newRecipe, ...state.recipes.filter((r) => r.id !== id)],
        }));

        try {
          await apiClient.post("/inventory/recipes", newRecipe);
        } catch {}

        return newRecipe;
      },

      createStockCount: async (countData) => {
        const countNum = get().stockCounts.length + 1;
        const newCount: StockCount = {
          ...countData,
          id: `cnt-${Date.now()}`,
          countNumber: `AUD-${new Date().getFullYear()}-${countNum.toString().padStart(4, "0")}`,
          status: "in_progress",
        };

        set((state) => ({
          stockCounts: [newCount, ...state.stockCounts],
        }));

        try {
          await apiClient.post("/inventory/counts", newCount);
        } catch {}

        return newCount;
      },

      updateStockCount: async (id, updates) => {
        set((state) => ({
          stockCounts: state.stockCounts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
        try {
          await apiClient.put(`/inventory/counts/${id}`, updates);
        } catch {}
      },

      approveStockCount: async (id, approvedBy) => {
        const count = get().stockCounts.find((c) => c.id === id);
        if (!count) return;

        const newMovements: StockMovement[] = [];
        const itemStockUpdates = new Map<string, number>();

        count.items.forEach((item) => {
          if (item.varianceQty !== 0) {
            itemStockUpdates.set(item.itemId, item.countedQty);
            newMovements.push({
              id: `mov-${Date.now()}-${item.itemId}`,
              movementDate: new Date().toISOString(),
              itemId: item.itemId,
              itemName: item.itemName,
              sku: item.sku,
              type: "adjustment",
              deltaQty: item.varianceQty,
              unit: item.unit,
              previousBalance: item.systemQty,
              newBalance: item.countedQty,
              unitCost: item.unitCost,
              totalCost: Math.abs(item.varianceValue),
              referenceType: "COUNT_RECONCILE",
              referenceNumber: count.countNumber,
              storageLocation: count.storageLocation,
              reason: `Physical stock count reconciliation approved by ${approvedBy}`,
              actorName: approvedBy,
              actorRole: "Operations Lead",
            });
          }
        });

        set((state) => ({
          stockCounts: state.stockCounts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: "approved",
                  approvedBy,
                  approvedAt: new Date().toISOString(),
                }
              : c
          ),
          movements: [...newMovements, ...state.movements],
          items: state.items.map((item) => {
            const counted = itemStockUpdates.get(item.id);
            if (counted === undefined) return item;
            const updatedStatus = calculateItemStatus(
              counted,
              item.reorderPoint,
              item.trackExpiry,
              item.shelfLifeDays
            );
            return {
              ...item,
              currentStock: counted,
              status: updatedStatus,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        try {
          await apiClient.patch(`/inventory/counts/${id}/approve`, { approvedBy });
        } catch {}
      },

      createTransfer: async (transferData) => {
        const count = get().transfers.length + 1;
        const newTransfer: StockTransfer = {
          ...transferData,
          id: `tr-${Date.now()}`,
          transferNumber: `TR-${new Date().getFullYear()}-${count.toString().padStart(4, "0")}`,
          status: "in_transit",
        };

        // Deduct from source items immediately
        const transferMovements: StockMovement[] = [];
        transferData.items.forEach((line) => {
          const item = get().items.find((i) => i.id === line.itemId);
          if (item) {
            const prev = item.currentStock;
            const next = Math.max(0, prev - line.dispatchedQty);
            transferMovements.push({
              id: `mov-${Date.now()}-${line.itemId}`,
              movementDate: new Date().toISOString(),
              itemId: line.itemId,
              itemName: line.itemName,
              sku: line.sku,
              type: "transfer",
              deltaQty: -line.dispatchedQty,
              unit: line.unit,
              previousBalance: prev,
              newBalance: next,
              unitCost: item.averageCost,
              totalCost: line.dispatchedQty * item.averageCost,
              referenceType: "TRANSFER",
              referenceNumber: newTransfer.transferNumber,
              storageLocation: item.storageLocation,
              reason: `Transfer to ${newTransfer.destinationOutlet}`,
              actorName: newTransfer.requestedBy,
              actorRole: "Inventory Controller",
            });
          }
        });

        set((state) => ({
          transfers: [newTransfer, ...state.transfers],
          movements: [...transferMovements, ...state.movements],
          items: state.items.map((item) => {
            const line = transferData.items.find((i) => i.itemId === item.id);
            if (!line) return item;
            const newStock = Math.max(0, item.currentStock - line.dispatchedQty);
            return {
              ...item,
              currentStock: newStock,
              status: calculateItemStatus(newStock, item.reorderPoint, item.trackExpiry, item.shelfLifeDays),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        try {
          await apiClient.post("/inventory/transfers", newTransfer);
        } catch {}

        return newTransfer;
      },

      completeTransfer: async (id, receivedBy, itemReconciliation) => {
        set((state) => ({
          transfers: state.transfers.map((t) => {
            if (t.id !== id) return t;
            const updatedItems = t.items.map((line) => {
              const rec = itemReconciliation.find((r) => r.itemId === line.itemId);
              if (!rec) return line;
              return {
                ...line,
                receivedQty: rec.receivedQty,
                damagedQty: rec.damagedQty,
                discrepancyNotes: rec.notes,
              };
            });
            return {
              ...t,
              status: "completed",
              receivedBy,
              items: updatedItems,
            };
          }),
        }));

        try {
          await apiClient.patch(`/inventory/transfers/${id}/complete`, {
            receivedBy,
            itemReconciliation,
          });
        } catch {}
      },

      updateSettings: async (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        try {
          await apiClient.put("/inventory/settings", newSettings);
        } catch {}
      },
    }),
    {
      name: "dineflow_inventory_store",
      partialize: (state) => ({
        items: state.items,
        suppliers: state.suppliers,
        purchaseOrders: state.purchaseOrders,
        grns: state.grns,
        recipes: state.recipes,
        movements: state.movements,
        stockCounts: state.stockCounts,
        transfers: state.transfers,
        settings: state.settings,
      }),
    }
  )
);
