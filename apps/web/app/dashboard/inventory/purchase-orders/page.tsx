"use client";

import * as React from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  FileText,
  Clock,
  XCircle,
  Truck,
  Building,
  Trash2,
  DollarSign,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useInventoryStore, PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from "@/lib/stores/inventory-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const items = useInventoryStore((s) => s.items);
  const createPurchaseOrder = useInventoryStore((s) => s.createPurchaseOrder);
  const approvePurchaseOrder = useInventoryStore((s) => s.approvePurchaseOrder);
  const updatePOStatus = useInventoryStore((s) => s.updatePOStatus);

  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [voucherPO, setVoucherPO] = React.useState<PurchaseOrder | null>(null);

  // Create PO Form State
  const [selectedSupplierId, setSelectedSupplierId] = React.useState(suppliers[0]?.id || "");
  const [expectedDate, setExpectedDate] = React.useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [deliveryLocation, setDeliveryLocation] = React.useState("Central Receiving Bay");
  const [poNotes, setPoNotes] = React.useState("");
  const [shippingCost, setShippingCost] = React.useState(0);
  const [poItems, setPoItems] = React.useState<PurchaseOrderItem[]>([]);

  // Initialize first line item on modal open
  const handleOpenCreateModal = () => {
    setSelectedSupplierId(suppliers[0]?.id || "");
    const firstItm = items[0];
    if (firstItm) {
      setPoItems([
        {
          itemId: firstItm.id,
          itemName: firstItm.name,
          sku: firstItm.sku,
          purchaseUnit: firstItm.purchaseUnit,
          quantity: 5,
          unitPrice: firstItm.purchaseCost,
          taxPercent: 5,
          total: 5 * firstItm.purchaseCost * 1.05,
        },
      ]);
    }
    setCreateModalOpen(true);
  };

  // Add line item
  const handleAddLine = () => {
    const firstItm = items[0];
    if (!firstItm) return;
    setPoItems([
      ...poItems,
      {
        itemId: firstItm.id,
        itemName: firstItm.name,
        sku: firstItm.sku,
        purchaseUnit: firstItm.purchaseUnit,
        quantity: 1,
        unitPrice: firstItm.purchaseCost,
        taxPercent: 5,
        total: firstItm.purchaseCost * 1.05,
      },
    ]);
  };

  // Update line item
  const handleUpdateLine = (index: number, updates: Partial<PurchaseOrderItem>) => {
    setPoItems(
      poItems.map((line, i) => {
        if (i !== index) return line;
        const updated = { ...line, ...updates };

        if (updates.itemId) {
          const matched = items.find((itm) => itm.id === updates.itemId);
          if (matched) {
            updated.itemName = matched.name;
            updated.sku = matched.sku;
            updated.purchaseUnit = matched.purchaseUnit;
            updated.unitPrice = matched.purchaseCost;
          }
        }

        const base = updated.quantity * updated.unitPrice;
        const tax = (base * updated.taxPercent) / 100;
        updated.total = base + tax;
        return updated;
      })
    );
  };

  const handleRemoveLine = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal = poItems.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const calculatedTax = poItems.reduce(
    (sum, line) => sum + (line.quantity * line.unitPrice * line.taxPercent) / 100,
    0
  );
  const calculatedGrandTotal = calculatedSubtotal + calculatedTax + shippingCost;

  // Submit PO
  const handleSubmitPO = async () => {
    if (poItems.length === 0) {
      toast({ title: "Items required", description: "Add at least one item line.", variant: "destructive" });
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

    const newPO = await createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(expectedDate).toISOString(),
      items: poItems,
      subtotal: calculatedSubtotal,
      taxTotal: calculatedTax,
      shippingCost,
      grandTotal: calculatedGrandTotal,
      deliveryLocation,
      notes: poNotes,
    });

    toast({
      title: "Purchase Order Created",
      description: `Issued ${newPO.poNumber} for ${supplier.name}.`,
    });
    setCreateModalOpen(false);
  };

  // 1-Click Approve PO
  const handleApprovePO = async (id: string, poNumber: string) => {
    await approvePurchaseOrder(id, user?.name || "Kitchen Operations Lead");
    toast({
      title: "Purchase Order Approved",
      description: `${poNumber} has been officially authorized for delivery.`,
    });
  };

  // Status Badge
  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="neutral" size="sm">Draft</Badge>;
      case "pending_approval":
        return <Badge variant="warning" size="sm" dot>Pending Approval</Badge>;
      case "approved":
        return <Badge variant="success" size="sm">Approved</Badge>;
      case "ordered":
        return <Badge variant="info" size="sm">Ordered</Badge>;
      case "partially_received":
        return <Badge variant="glow" size="sm">Partial GRN</Badge>;
      case "received":
        return <Badge variant="success" size="sm">Received</Badge>;
      case "cancelled":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
    }
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    if (statusFilter !== "all" && po.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Purchase Orders & Commercial Procurement
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Procurement workflows, vendor purchase vouchers, approvals and expected receiving
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Purchase Order</span>
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search PO # or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "all", label: "All" },
            { id: "pending_approval", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "ordered", label: "Ordered" },
            { id: "received", label: "Received" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
                statusFilter === st.id
                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Orders Table */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <TableHead className="font-bold text-xs">PO Number</TableHead>
                <TableHead className="font-bold text-xs">Supplier</TableHead>
                <TableHead className="font-bold text-xs">Order Date</TableHead>
                <TableHead className="font-bold text-xs">Expected Delivery</TableHead>
                <TableHead className="font-bold text-xs">Total Amount</TableHead>
                <TableHead className="font-bold text-xs">Status</TableHead>
                <TableHead className="font-bold text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No purchase orders found matching this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPOs.map((po) => (
                  <TableRow key={po.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {po.poNumber}
                    </TableCell>

                    <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {po.supplierName}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {new Date(po.orderDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(po.grandTotal)}
                    </TableCell>

                    <TableCell>{getStatusBadge(po.status)}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {po.status === "pending_approval" && (
                          <Button
                            size="sm"
                            onClick={() => handleApprovePO(po.id, po.poNumber)}
                            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            Approve
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVoucherPO(po)}
                          className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Voucher</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Draft Commercial Purchase Order"
        description="Select vendor, input line quantities and delivery requirements"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitPO} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Issue PO
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Supplier *</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.paymentTerms})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Expected Delivery Date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />

            <Input
              label="Receiving Bay"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
            />
          </div>

          {/* Line Items Multi Adder */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Order Line Items</span>
              <Button size="sm" variant="ghost" onClick={handleAddLine} className="gap-1 text-xs text-emerald-600 cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-2">
              {poItems.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="col-span-12 sm:col-span-5">
                    <select
                      value={line.itemId}
                      onChange={(e) => handleUpdateLine(idx, { itemId: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium"
                    >
                      {items.map((itm) => (
                        <option key={itm.id} value={itm.id}>
                          {itm.name} ({itm.purchaseUnit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => handleUpdateLine(idx, { quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-2 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={line.unitPrice}
                      onChange={(e) => handleUpdateLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2 text-right font-extrabold text-xs">
                    {formatCurrency(line.total)}
                  </div>

                  <div className="col-span-1 text-right">
                    <button onClick={() => handleRemoveLine(idx)} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotals */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculatedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST Tax Total:</span>
                <span>{formatCurrency(calculatedTax)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Grand Total:</span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(calculatedGrandTotal)}</span>
              </div>
            </div>
          </div>

          <Input
            label="Special Delivery Instructions"
            placeholder="e.g. Temperature must be under 4°C upon delivery"
            value={poNotes}
            onChange={(e) => setPoNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Printable Purchase Order Voucher Modal */}
      <Modal
        isOpen={Boolean(voucherPO)}
        onClose={() => setVoucherPO(null)}
        title="Purchase Order Voucher"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setVoucherPO(null)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              <Printer className="h-4 w-4" />
              <span>Print Voucher</span>
            </Button>
          </div>
        }
      >
        {voucherPO && (
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl space-y-6 text-xs print:m-0 print:p-0">
            {/* Voucher Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold font-display">{tenant?.name || "DineFlow Restaurant"}</h2>
                <p className="text-slate-500 text-[11px] mt-0.5">Commercial Procurement Department</p>
                <p className="text-slate-500 text-[11px]">GSTIN: 27AABCU9603R1ZM</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {voucherPO.poNumber}
                </span>
                <p className="text-slate-500 text-[11px]">Date: {new Date(voucherPO.orderDate).toLocaleDateString()}</p>
                <p className="text-slate-500 text-[11px]">Expected: {new Date(voucherPO.expectedDeliveryDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Vendor Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Vendor</span>
                <strong className="text-sm block">{voucherPO.supplierName}</strong>
                <p className="text-slate-500 text-[11px] mt-1">Delivery to: {voucherPO.deliveryLocation}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Approval</span>
                <span className="text-emerald-600 font-bold block">{voucherPO.approvedBy || "Pending Manager Approval"}</span>
                {voucherPO.approvedAt && (
                  <p className="text-slate-500 text-[11px] mt-1">Authorized on {new Date(voucherPO.approvedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                  <th className="py-2">Item</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Tax</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {voucherPO.items.map((line, idx) => (
                  <tr key={idx} className="text-xs">
                    <td className="py-2.5 font-bold">{line.itemName}</td>
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">{line.sku}</td>
                    <td className="py-2.5 text-right">{line.quantity} {line.purchaseUnit}</td>
                    <td className="py-2.5 text-right">{formatCurrency(line.unitPrice)}</td>
                    <td className="py-2.5 text-right">{line.taxPercent}%</td>
                    <td className="py-2.5 text-right font-extrabold">{formatCurrency(line.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(voucherPO.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST:</span>
                  <span>{formatCurrency(voucherPO.taxTotal)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(voucherPO.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-[11px] text-slate-400">
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-center">
                Authorized Executive Signature
              </div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-center">
                Vendor Acceptance & Stamp
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
