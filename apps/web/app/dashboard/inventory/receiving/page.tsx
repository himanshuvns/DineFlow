"use client";

import * as React from "react";
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useInventoryStore, GoodsReceivedNote, GrnLineItem } from "@/lib/stores/inventory-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function StockReceivingPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const grns = useInventoryStore((s) => s.grns);
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const items = useInventoryStore((s) => s.items);
  const createGRN = useInventoryStore((s) => s.createGRN);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedPOId, setSelectedPOId] = React.useState<string>("");
  const [receivingSupplier, setReceivingSupplier] = React.useState(suppliers[0]?.name || "");
  const [grnNotes, setGrnNotes] = React.useState("");
  const [grnLines, setGrnLines] = React.useState<GrnLineItem[]>([]);

  // When PO changes, populate line items
  React.useEffect(() => {
    if (selectedPOId) {
      const po = purchaseOrders.find((p) => p.id === selectedPOId);
      if (po) {
        setReceivingSupplier(po.supplierName);
        setGrnLines(
          po.items.map((line) => {
            const itm = items.find((i) => i.id === line.itemId);
            return {
              itemId: line.itemId,
              itemName: line.itemName,
              sku: line.sku,
              unit: line.purchaseUnit,
              orderedQty: line.quantity,
              receivedQty: line.quantity,
              rejectedQty: 0,
              rejectionReason: "",
              unitCost: line.unitPrice,
              batchNumber: `LOT-${Date.now().toString().slice(-4)}`,
              mfgDate: new Date().toISOString().slice(0, 10),
              expiryDate: new Date(Date.now() + 86400000 * (itm?.shelfLifeDays || 90))
                .toISOString()
                .slice(0, 10),
              storageLocation: itm?.storageLocation || "Central Receiving Bay",
              totalCost: line.quantity * line.unitPrice,
            };
          })
        );
      }
    }
  }, [selectedPOId, purchaseOrders, items]);

  const handleOpenGRNModal = () => {
    const activePO = purchaseOrders.find((p) => p.status === "ordered" || p.status === "approved");
    setSelectedPOId(activePO?.id || "");
    setModalOpen(true);
  };

  const handleUpdateLine = (index: number, updates: Partial<GrnLineItem>) => {
    setGrnLines(
      grnLines.map((line, idx) => {
        if (idx !== index) return line;
        const updated = { ...line, ...updates };
        updated.totalCost = updated.receivedQty * updated.unitCost;
        return updated;
      })
    );
  };

  const calculatedGrandTotal = grnLines.reduce((sum, line) => sum + line.totalCost, 0);

  const handleSubmitGRN = async () => {
    if (grnLines.length === 0) {
      toast({ title: "No Items", description: "At least one item must be received.", variant: "destructive" });
      return;
    }

    const matchedPO = purchaseOrders.find((p) => p.id === selectedPOId);

    const newGRN = await createGRN({
      poId: selectedPOId || undefined,
      poNumber: matchedPO?.poNumber,
      supplierName: receivingSupplier,
      receivedDate: new Date().toISOString(),
      receivedBy: user?.name || "Kitchen Receiving Inspector",
      items: grnLines,
      grandTotal: calculatedGrandTotal,
      notes: grnNotes,
      status: grnLines.some((l) => l.rejectedQty > 0) ? "discrepancy" : "verified",
    });

    toast({
      title: "Stock Received & Reconciled",
      description: `${newGRN.grnNumber} posted. Inventory ledger and current quantities updated automatically.`,
    });
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Stock Receiving & Goods Received Notes (GRN)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Verify physical deliveries, record batch numbers, reject damaged shipments and auto-post stock
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenGRNModal}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Receiving Note</span>
        </Button>
      </div>

      {/* Historical GRN Records Table */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Goods Received Notes History ({grns.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Immutable physical delivery audit receipts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <TableHead className="font-bold text-xs">GRN Number</TableHead>
                  <TableHead className="font-bold text-xs">Reference PO</TableHead>
                  <TableHead className="font-bold text-xs">Supplier</TableHead>
                  <TableHead className="font-bold text-xs">Received Date</TableHead>
                  <TableHead className="font-bold text-xs">Received By</TableHead>
                  <TableHead className="font-bold text-xs">Grand Total</TableHead>
                  <TableHead className="font-bold text-xs">Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grns.map((grn) => (
                  <TableRow key={grn.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {grn.grnNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {grn.poNumber || "Direct Receipt"}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {grn.supplierName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(grn.receivedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {grn.receivedBy}
                    </TableCell>
                    <TableCell className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(grn.grandTotal)}
                    </TableCell>
                    <TableCell>
                      {grn.status === "verified" ? (
                        <Badge variant="success" size="sm">Verified 100%</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Discrepancy</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New GRN Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Physical Intake Goods Received Note"
        description="Verify received quantities against purchase order or record spot market intake"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitGRN} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm Receipt & Post Stock
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Purchase Order Reference
              </label>
              <select
                value={selectedPOId}
                onChange={(e) => setSelectedPOId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
              >
                <option value="">Direct / Cash Purchase (No PO)</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} — {po.supplierName} ({formatCurrency(po.grandTotal)})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Supplier Name"
              value={receivingSupplier}
              onChange={(e) => setReceivingSupplier(e.target.value)}
            />
          </div>

          {/* Lines */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Shipment Line Inspection
            </span>

            <div className="space-y-3">
              {grnLines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{line.itemName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{line.sku}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Received Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={line.receivedQty}
                        onChange={(e) =>
                          handleUpdateLine(idx, { receivedQty: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block">Rejected Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={line.rejectedQty}
                        onChange={(e) =>
                          handleUpdateLine(idx, { rejectedQty: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block">Batch / Lot #</label>
                      <input
                        type="text"
                        value={line.batchNumber}
                        onChange={(e) => handleUpdateLine(idx, { batchNumber: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block">Expiry Date</label>
                      <input
                        type="date"
                        value={line.expiryDate}
                        onChange={(e) => handleUpdateLine(idx, { expiryDate: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>

                  {line.rejectedQty > 0 && (
                    <div>
                      <label className="text-[10px] text-rose-500 font-semibold block">
                        Rejection Reason
                      </label>
                      <select
                        value={line.rejectionReason}
                        onChange={(e) => handleUpdateLine(idx, { rejectionReason: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300"
                      >
                        <option value="Damaged in transit">Damaged in transit</option>
                        <option value="Expired / Past shelf life">Expired / Past shelf life</option>
                        <option value="Quality / Texture rejected">Quality / Texture rejected</option>
                        <option value="Wrong item or size">Wrong item or size</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Inspector Remarks / Receiving Notes"
            placeholder="e.g. Temperature checked at 3.2°C. Driver seal verified."
            value={grnNotes}
            onChange={(e) => setGrnNotes(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
