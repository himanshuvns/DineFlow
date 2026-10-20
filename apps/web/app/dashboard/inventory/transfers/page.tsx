"use client";

import * as React from "react";
import {
  GitPullRequest,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useInventoryStore, StockTransfer, TransferItem } from "@/lib/stores/inventory-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function TransfersPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const transfers = useInventoryStore((s) => s.transfers);
  const items = useInventoryStore((s) => s.items);
  const createTransfer = useInventoryStore((s) => s.createTransfer);
  const completeTransfer = useInventoryStore((s) => s.completeTransfer);

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [receiveModalTransfer, setReceiveModalTransfer] = React.useState<StockTransfer | null>(null);

  // Create form
  const [sourceOutlet, setSourceOutlet] = React.useState("Central Commissary / Main Kitchen");
  const [destinationOutlet, setDestinationOutlet] = React.useState("Rooftop Lounge & Bar");
  const [transferNotes, setTransferNotes] = React.useState("");
  const [transferLines, setTransferLines] = React.useState<TransferItem[]>([]);

  // Receive form
  const [reconciliationLines, setReconciliationLines] = React.useState<
    Array<{ itemId: string; receivedQty: number; damagedQty: number; notes: string }>
  >([]);

  const handleOpenCreateModal = () => {
    const firstItm = items[0];
    if (firstItm) {
      setTransferLines([
        {
          itemId: firstItm.id,
          itemName: firstItm.name,
          sku: firstItm.sku,
          unit: firstItm.baseUnit,
          requestedQty: 1000,
          dispatchedQty: 1000,
          receivedQty: 0,
          damagedQty: 0,
        },
      ]);
    }
    setCreateModalOpen(true);
  };

  const handleAddLine = () => {
    const firstItm = items[0];
    if (!firstItm) return;
    setTransferLines([
      ...transferLines,
      {
        itemId: firstItm.id,
        itemName: firstItm.name,
        sku: firstItm.sku,
        unit: firstItm.baseUnit,
        requestedQty: 500,
        dispatchedQty: 500,
        receivedQty: 0,
        damagedQty: 0,
      },
    ]);
  };

  const handleCreateSubmit = async () => {
    if (transferLines.length === 0) return;

    const newTransfer = await createTransfer({
      sourceOutlet,
      destinationOutlet,
      transferDate: new Date().toISOString(),
      requestedBy: user?.name || "Kitchen Controller",
      items: transferLines,
      notes: transferNotes,
    });

    toast({
      title: "Stock Transfer Initiated",
      description: `${newTransfer.transferNumber} is now in transit to ${destinationOutlet}.`,
    });
    setCreateModalOpen(false);
  };

  const handleOpenReceive = (t: StockTransfer) => {
    setReceiveModalTransfer(t);
    setReconciliationLines(
      t.items.map((i) => ({
        itemId: i.itemId,
        receivedQty: i.dispatchedQty,
        damagedQty: 0,
        notes: "",
      }))
    );
  };

  const handleConfirmReceive = async () => {
    if (!receiveModalTransfer) return;

    await completeTransfer(
      receiveModalTransfer.id,
      user?.name || "Destination Manager",
      reconciliationLines
    );

    toast({
      title: "Transfer Received & Reconciled",
      description: `${receiveModalTransfer.transferNumber} received at destination outlet.`,
    });
    setReceiveModalTransfer(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <GitPullRequest className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Multi-Outlet & Department Stock Transfers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Inter-kitchen transfers, bar replenishments, transit tracking and breakage logs
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Stock Transfer</span>
        </Button>
      </div>

      {/* Transfers List */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Transfer Dispatches ({transfers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <TableHead className="font-bold text-xs">Transfer #</TableHead>
                  <TableHead className="font-bold text-xs">Source Outlet</TableHead>
                  <TableHead className="font-bold text-xs">Destination</TableHead>
                  <TableHead className="font-bold text-xs">Date</TableHead>
                  <TableHead className="font-bold text-xs">Status</TableHead>
                  <TableHead className="font-bold text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow key={t.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {t.transferNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">{t.sourceOutlet}</TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {t.destinationOutlet}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(t.transferDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {t.status === "in_transit" ? (
                        <Badge variant="warning" size="sm" dot>In Transit</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Completed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.status === "in_transit" ? (
                        <Button
                          size="sm"
                          onClick={() => handleOpenReceive(t)}
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          Receive Goods
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Reconciled</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Transfer Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Dispatch Inter-Outlet Transfer"
        description="Deducts stock from source immediately and places in transit"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Dispatch Transfer
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Source Store</label>
              <select
                value={sourceOutlet}
                onChange={(e) => setSourceOutlet(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
              >
                <option value="Central Commissary / Main Kitchen">Central Commissary / Main Kitchen</option>
                <option value="Central Bar Store">Central Bar Store</option>
                <option value="Bakery Storage">Bakery Storage</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Destination Outlet</label>
              <select
                value={destinationOutlet}
                onChange={(e) => setDestinationOutlet(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
              >
                <option value="Rooftop Lounge & Bar">Rooftop Lounge & Bar</option>
                <option value="In-Room Dining Pantry">In-Room Dining Pantry</option>
                <option value="Poolside Bistro">Poolside Bistro</option>
                <option value="Banquet Event Hall">Banquet Event Hall</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dispatched Goods</span>
              <Button size="sm" variant="ghost" onClick={handleAddLine} className="text-xs text-emerald-600 gap-1 cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-2">
              {transferLines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="col-span-8">
                    <select
                      value={line.itemId}
                      onChange={(e) => {
                        const itm = items.find((i) => i.id === e.target.value);
                        if (itm) {
                          setTransferLines(
                            transferLines.map((l, i) =>
                              i === idx ? { ...l, itemId: itm.id, itemName: itm.name, sku: itm.sku, unit: itm.baseUnit } : l
                            )
                          );
                        }
                      }}
                      className="w-full px-2 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium"
                    >
                      {items.map((itm) => (
                        <option key={itm.id} value={itm.id}>
                          {itm.name} (Available: {itm.currentStock} {itm.baseUnit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={line.dispatchedQty}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setTransferLines(
                          transferLines.map((l, i) => (i === idx ? { ...l, dispatchedQty: val, requestedQty: val } : l))
                        );
                      }}
                      className="w-full px-2 py-1.5 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right"
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => setTransferLines(transferLines.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Internal Notes"
            placeholder="e.g. VIP banquet reservation transfer"
            value={transferNotes}
            onChange={(e) => setTransferNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Receive Transfer Modal */}
      <Modal
        isOpen={Boolean(receiveModalTransfer)}
        onClose={() => setReceiveModalTransfer(null)}
        title={receiveModalTransfer ? `Receive Transfer: ${receiveModalTransfer.transferNumber}` : "Receive Transfer"}
        description="Verify received quantities against dispatch note and flag transit damage"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setReceiveModalTransfer(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmReceive} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm Receipt
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {receiveModalTransfer?.items.map((line, idx) => {
            const rec = reconciliationLines[idx];
            return (
              <div key={line.itemId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{line.itemName}</span>
                  <span className="text-slate-500">Dispatched: {line.dispatchedQty} {line.unit}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Received Intact</label>
                    <input
                      type="number"
                      value={rec?.receivedQty || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setReconciliationLines(
                          reconciliationLines.map((r, i) => (i === idx ? { ...r, receivedQty: val } : r))
                        );
                      }}
                      className="w-full px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-rose-500 block">Damaged in Transit</label>
                    <input
                      type="number"
                      value={rec?.damagedQty || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setReconciliationLines(
                          reconciliationLines.map((r, i) => (i === idx ? { ...r, damagedQty: val } : r))
                        );
                      }}
                      className="w-full px-2 py-1 rounded-lg text-xs font-bold text-rose-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
