"use client";

import * as React from "react";
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  Building2,
  Gift,
  ShieldCheck,
  ChefHat,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency } from "@/lib/utils";

export interface StaffOrderFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomNumber: string;
  roomName: string;
  guestName?: string;
  guestPhone?: string;
  bookingId?: string;
  tenantSlug: string;
  onOrderPlaced?: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
}

type BillingMethod = "room_folio" | "immediate" | "complimentary";

export function StaffOrderFoodModal({
  isOpen,
  onClose,
  roomId,
  roomNumber,
  roomName,
  guestName,
  guestPhone,
  bookingId,
  tenantSlug,
  onOrderPlaced,
}: StaffOrderFoodModalProps) {
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [categories, setCategories] = React.useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [billingMethod, setBillingMethod] = React.useState<BillingMethod>("room_folio");
  const [complimentaryReason, setComplimentaryReason] = React.useState("VIP Guest Courtesy");
  const [staffName, setStaffName] = React.useState(user?.name || "Front Desk Staff");
  const [orderNotes, setOrderNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync staff name if user changes
  React.useEffect(() => {
    if (user?.name) {
      setStaffName(user.name);
    }
  }, [user]);

  // Load Menu items
  React.useEffect(() => {
    if (!isOpen) return;

    async function loadMenu() {
      try {
        setLoadingMenu(true);
        const res = await fetch(`/api/menu/public?slug=${encodeURIComponent(tenantSlug)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          const itemsList: MenuItem[] = [];
          const catList: string[] = [];

          if (Array.isArray(data.categories)) {
            data.categories.forEach((catEntry: any) => {
              const catName = catEntry.category?.name || "All-Day Dining";
              if (!catList.includes(catName)) catList.push(catName);

              if (Array.isArray(catEntry.items)) {
                catEntry.items.forEach((it: any) => {
                  if (it.isAvailable !== false) {
                    itemsList.push({
                      id: it.id || it._id,
                      name: it.name,
                      description: it.description || "",
                      basePrice: it.basePrice || it.price || 0,
                      category: catName,
                      isVeg: it.dietaryTags?.includes("veg") || it.isVeg === true,
                      isAvailable: it.isAvailable !== false,
                    });
                  }
                });
              }
            });
          } else if (Array.isArray(data.menuItems)) {
            data.menuItems.forEach((it: any) => {
              const catName = it.category || "All-Day Dining";
              if (!catList.includes(catName)) catList.push(catName);
              if (it.isAvailable !== false) {
                itemsList.push({
                  id: it.id || it._id,
                  name: it.name,
                  description: it.description || "",
                  basePrice: it.basePrice || it.price || 0,
                  category: catName,
                  isVeg: it.dietaryTags?.includes("veg") || it.isVeg === true,
                  isAvailable: it.isAvailable !== false,
                });
              }
            });
          }

          setCategories(["all", ...catList]);
          setMenuItems(itemsList);
        }
      } catch (err) {
        console.warn("Failed to load menu for staff ordering:", err);
      } finally {
        setLoadingMenu(false);
      }
    }

    loadMenu();
  }, [isOpen, tenantSlug]);

  const cleanRoomNum = roomNumber.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

  // Add Item to Cart
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItemId === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          menuItemId: item.id,
          name: item.name,
          unitPrice: item.basePrice,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (cartId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((ci) => ci.id !== cartId));
    } else {
      setCart((prev) =>
        prev.map((ci) => (ci.id === cartId ? { ...ci, quantity: qty } : ci))
      );
    }
  };

  const handleRemoveItem = (cartId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== cartId));
  };

  // Calculations
  const rawSubtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const rawTax = rawSubtotal * 0.05;
  const rawTotal = rawSubtotal + rawTax;

  const isComplimentary = billingMethod === "complimentary";
  const finalSubtotal = isComplimentary ? 0 : rawSubtotal;
  const finalTax = isComplimentary ? 0 : rawTax;
  const finalTotal = isComplimentary ? 0 : rawTotal;

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      addToast("error", "Empty Order", "Please select at least one dish for the room.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        tenantSlug,
        tableQRSlug: `room-${cleanRoomNum.toLowerCase()}`,
        tableSlug: `room-${cleanRoomNum.toLowerCase()}`,
        roomNumber: cleanRoomNum,
        roomId,
        bookingId: bookingId || "",
        destination: "room_service",
        orderSource: "front_desk",
        placedBy: staffName.trim() || "Front Desk Staff",
        billingMethod,
        complimentaryReason: isComplimentary ? complimentaryReason : undefined,
        chargeToFolio: billingMethod === "room_folio",
        customerName: guestName || `Guest Suite ${cleanRoomNum}`,
        customerPhone: guestPhone || "9999999999",
        specialInstructions: [
          `Ordered by Front Desk (${staffName.trim() || "Staff"})`,
          `Billing: ${
            billingMethod === "room_folio"
              ? "Charge to Room Folio"
              : billingMethod === "complimentary"
              ? `Complimentary (${complimentaryReason})`
              : "Immediate Payment at Desk"
          }`,
          orderNotes.trim() ? `Note: ${orderNotes.trim()}` : "",
        ]
          .filter(Boolean)
          .join(" • "),
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          unitPrice: isComplimentary ? 0 : i.unitPrice,
          quantity: i.quantity,
          notes: i.notes,
        })),
      };

      const res = await fetch("/api/menu/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(resData?.error || "Failed to dispatch order to kitchen");
      }

      addToast(
        "success",
        "Room Order Dispatched!",
        `Order for Suite ${cleanRoomNum} sent to Kitchen (KDS). Method: ${
          billingMethod === "room_folio"
            ? "Room Folio"
            : billingMethod === "complimentary"
            ? "Complimentary"
            : "Immediate"
        }`
      );

      setCart([]);
      setOrderNotes("");
      onClose();
      if (onOrderPlaced) onOrderPlaced();
    } catch (err: any) {
      console.error("[staff-order-food] Error:", err);
      addToast("error", "Order Placement Failed", err?.message || "Could not dispatch order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Front Desk In-Room Dining Order`}
      size="xl"
    >
      <div className="space-y-4 pt-1">
        {/* Guest & Room Context Banner */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 font-bold">
              #{cleanRoomNum}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-white">
                  {roomName || `Suite ${cleanRoomNum}`}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  In-House Guest
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Guest: <span className="font-semibold text-slate-800 dark:text-slate-200">{guestName || "Current Resident"}</span>
                {guestPhone && ` • ${guestPhone}`}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <Badge variant="outline" size="sm" className="font-mono text-[10px]">
              KDS: Room Service
            </Badge>
          </div>
        </div>

        {/* ── Billing Method Selector ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Billing & Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. Room Folio */}
            <button
              type="button"
              onClick={() => setBillingMethod("room_folio")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                billingMethod === "room_folio"
                  ? "bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white ring-1 ring-emerald-500/30"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <Building2 className={`h-4 w-4 ${billingMethod === "room_folio" ? "text-emerald-500" : "text-slate-400"}`} />
                {billingMethod === "room_folio" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Charge to Room</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Post to Folio at checkout</p>
              </div>
            </button>

            {/* 2. Immediate Payment */}
            <button
              type="button"
              onClick={() => setBillingMethod("immediate")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                billingMethod === "immediate"
                  ? "bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white ring-1 ring-emerald-500/30"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <CreditCard className={`h-4 w-4 ${billingMethod === "immediate" ? "text-emerald-500" : "text-slate-400"}`} />
                {billingMethod === "immediate" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Immediate Payment</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Paid at front desk / counter</p>
              </div>
            </button>

            {/* 3. Complimentary */}
            <button
              type="button"
              onClick={() => setBillingMethod("complimentary")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                billingMethod === "complimentary"
                  ? "bg-purple-500/10 border-purple-500 text-slate-900 dark:text-white ring-1 ring-purple-500/30"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <Gift className={`h-4 w-4 ${billingMethod === "complimentary" ? "text-purple-500" : "text-slate-400"}`} />
                {billingMethod === "complimentary" && <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Complimentary</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">Waived to ₹0 (VIP)</p>
              </div>
            </button>
          </div>

          {/* Complimentary Reason Input */}
          {isComplimentary && (
            <div className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 animate-in fade-in duration-200 space-y-1">
              <label className="text-[11px] font-bold text-purple-900 dark:text-purple-300">
                Reason for Complimentary Dining Waiver:
              </label>
              <input
                type="text"
                value={complimentaryReason}
                onChange={(e) => setComplimentaryReason(e.target.value)}
                placeholder="e.g. VIP Suite Welcome, Service Delay Recovery, Management Courtesy"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          )}
        </div>

        {/* ── Main Two-Column Layout: Menu Browser (Left) & Cart / Summary (Right) ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
          {/* Menu Browser (7 Cols) */}
          <div className="md:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Menu Catalogue
              </span>
              <span className="text-[11px] text-slate-400">{filteredItems.length} Dishes</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search dishes, drinks, appetizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Selector */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap capitalize transition-colors ${
                      selectedCategory === c
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {c === "all" ? "All Items" : c}
                  </button>
                ))}
              </div>
            )}

            {/* Menu List */}
            <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5 pr-1 border rounded-xl border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-950/40">
              {loadingMenu ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading menu...</div>
              ) : filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No matching dishes found.</div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2.5 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold mt-0.5">
                        {formatCurrency(item.basePrice, "INR")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart & Summary (5 Cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Guest Tray ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                </span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="text-[10px] text-rose-500 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-0.5">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <UtensilsCrossed className="h-6 w-6 mx-auto mb-1 opacity-40" />
                    Tray is empty. Click "+ Add" on dishes.
                  </div>
                ) : (
                  cart.map((ci) => (
                    <div
                      key={ci.id}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {ci.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {formatCurrency(ci.unitPrice, "INR")} x {ci.quantity} ={" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(ci.unitPrice * ci.quantity, "INR")}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(ci.id, ci.quantity - 1)}
                          className="h-6 w-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{ci.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(ci.id, ci.quantity + 1)}
                          className="h-6 w-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(ci.id)}
                          className="h-6 w-6 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-center justify-center ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bill Details */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">
                  {isComplimentary ? (
                    <span>
                      <span className="line-through opacity-50 mr-1.5">
                        {formatCurrency(rawSubtotal, "INR")}
                      </span>
                      <span className="text-purple-600 font-bold">₹0</span>
                    </span>
                  ) : (
                    formatCurrency(rawSubtotal, "INR")
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST / Taxes (5%)</span>
                <span className="font-mono">
                  {isComplimentary ? (
                    <span>
                      <span className="line-through opacity-50 mr-1.5">
                        {formatCurrency(rawTax, "INR")}
                      </span>
                      <span className="text-purple-600 font-bold">₹0</span>
                    </span>
                  ) : (
                    formatCurrency(rawTax, "INR")
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total Due</span>
                <span
                  className={`font-mono text-sm font-black ${
                    isComplimentary
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isComplimentary ? "₹0.00 (Complimentary)" : formatCurrency(finalTotal, "INR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Staff Metadata & Kitchen Notes ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Order Placed By (Staff Name)
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. Front Desk Staff"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Kitchen Instructions / Special Request
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Extra cutlery, deliver hot to suite door"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmitOrder}
            disabled={cart.length === 0 || isSubmitting}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md"
          >
            <ChefHat className="h-3.5 w-3.5" />
            <span>
              {isSubmitting
                ? "Transmitting Order..."
                : `Dispatch to Kitchen (${
                    billingMethod === "room_folio"
                      ? "Charge Folio"
                      : billingMethod === "complimentary"
                      ? "Waived"
                      : "Immediate"
                  })`}
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
