"use client";

import * as React from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  Edit2,
  Trash2,
  ShoppingCart,
  DollarSign,
  FileText,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useInventoryStore, Supplier } from "@/lib/stores/inventory-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function SuppliersDirectoryPage() {
  const { toast } = useToast();
  const suppliers = useInventoryStore((s) => s.suppliers);
  const addSupplier = useInventoryStore((s) => s.addSupplier);
  const updateSupplier = useInventoryStore((s) => s.updateSupplier);
  const deleteSupplier = useInventoryStore((s) => s.deleteSupplier);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");

  const [formData, setFormData] = React.useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstin: "",
    address: "",
    paymentTerms: "Net 15" as "Immediate / COD" | "Net 7" | "Net 15" | "Net 30" | "Net 60",
    categories: "Produce, Dairy",
    rating: 5,
    leadTimeDays: 2,
    notes: "",
    status: "active" as "active" | "inactive",
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      gstin: "",
      address: "",
      paymentTerms: "Net 15",
      categories: "Produce, Dairy",
      rating: 5,
      leadTimeDays: 2,
      notes: "",
      status: "active",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      gstin: sup.gstin,
      address: sup.address,
      paymentTerms: sup.paymentTerms,
      categories: sup.categories.join(", "),
      rating: sup.rating,
      leadTimeDays: sup.leadTimeDays,
      notes: sup.notes || "",
      status: sup.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name Required", description: "Supplier name cannot be empty.", variant: "destructive" });
      return;
    }

    const categoriesArray = formData.categories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, {
        ...formData,
        categories: categoriesArray,
      });
      toast({ title: "Supplier Updated", description: `${formData.name} was successfully modified.` });
    } else {
      await addSupplier({
        ...formData,
        categories: categoriesArray,
        leadTimeDays: formData.leadTimeDays,
        status: formData.status,
      });
      toast({ title: "Supplier Enrolled", description: `${formData.name} added to procurement directory.` });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete supplier ${name}?`)) {
      await deleteSupplier(id);
      toast({ title: "Supplier Removed", description: `${name} has been deleted.` });
    }
  };

  const filtered = suppliers.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.gstin.toLowerCase().includes(q) ||
      s.categories.some((c) => c.toLowerCase().includes(q))
    );
  });

  const totalProcurementSpend = suppliers.reduce((sum, s) => sum + s.totalSpend, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
                Supplier Directory & Vendor Accounts
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Vendor contacts, GSTIN tax registration, payment terms, and historical spend
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Supplier</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-5">
          <span className="text-xs font-semibold text-slate-500">Active Suppliers</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {suppliers.filter((s) => s.status === "active").length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved commercial vendors</p>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-5">
          <span className="text-xs font-semibold text-slate-500">Total Procurement Spend</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalProcurementSpend)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Cumulative purchase disbursements</p>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-5">
          <span className="text-xs font-semibold text-slate-500">Active Purchase Orders</span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {suppliers.reduce((sum, s) => sum + s.activeOrders, 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">In fulfillment pipeline</p>
        </Card>
      </div>

      {/* Search & View Toggle */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
          />
        </div>

        <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setViewMode("cards")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer",
              viewMode === "cards" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs" : "text-slate-400"
            )}
          >
            Vendor Cards
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer",
              viewMode === "table" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs" : "text-slate-400"
            )}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Vendors Display */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <Card
              key={s.id}
              className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {s.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Attn: {s.contactPerson}
                    </p>
                  </div>
                  <Badge variant={s.status === "active" ? "success" : "neutral"} size="sm">
                    {s.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Rating & Payment Terms */}
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.rating}</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <Badge variant="neutral" size="sm">{s.paymentTerms}</Badge>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{s.leadTimeDays}d Lead Time</span>
                </div>

                {/* Contact Information */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{s.gstin}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-[11px]">{s.address}</span>
                  </div>
                </div>

                {/* Supplied Categories */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {s.categories.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spend & Footer Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Spend</span>
                  <strong className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(s.totalSpend)}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link href={`/dashboard/inventory/purchase-orders?supplier=${s.id}`}>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs cursor-pointer">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>PO</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(s)}
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(s.id, s.name)}
                    className="h-8 w-8 p-0 cursor-pointer text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <TableHead className="font-bold text-xs">Supplier Name</TableHead>
                  <TableHead className="font-bold text-xs">Contact Person</TableHead>
                  <TableHead className="font-bold text-xs">GSTIN</TableHead>
                  <TableHead className="font-bold text-xs">Payment Terms</TableHead>
                  <TableHead className="font-bold text-xs">Total Spend</TableHead>
                  <TableHead className="font-bold text-xs">Rating</TableHead>
                  <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{s.contactPerson}</div>
                      <div className="text-[11px] text-slate-400">{s.phone}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{s.gstin}</TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">{s.paymentTerms}</Badge>
                    </TableCell>
                    <TableCell className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(s.totalSpend)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{s.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(s)}
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s.id, s.name)}
                          className="h-8 w-8 p-0 cursor-pointer text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : "Enroll Commercial Vendor"}
        description="Vendor details for tax invoices, automated PO dispatches and credit control"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {editingSupplier ? "Update Supplier" : "Save Supplier"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Vendor / Business Name *"
            placeholder="e.g. Apex Agro Fresh Pvt Ltd"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              placeholder="e.g. Rajesh Sharma"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="+91 98201 54321"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              placeholder="orders@apexagro.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="GSTIN Tax Number"
              placeholder="27AABCU9603R1ZM"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentTerms: e.target.value as "Immediate / COD" | "Net 7" | "Net 15" | "Net 30" | "Net 60",
                  })
                }
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
              >
                <option value="Immediate / COD">Immediate / Cash on Delivery</option>
                <option value="Net 7">Net 7 Days</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>

            <Input
              label="Lead Time (Days)"
              type="number"
              value={formData.leadTimeDays}
              onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 1 })}
            />
          </div>

          <Input
            label="Supplied Categories (Comma Separated)"
            placeholder="Produce, Dairy, Meat"
            value={formData.categories}
            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
          />

          <Input
            label="Commercial Address"
            placeholder="Plot 42, Vashi APMC Market, Navi Mumbai"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
