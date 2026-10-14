"use client";

import * as React from "react";
import {
  Star,
  Quote,
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
  UtensilsCrossed,
  Coffee,
  Hotel,
  Flame,
  CheckCircle2,
  X,
  Building2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  restaurant: string;
  city: string;
  category: "restaurant" | "cafe" | "hotel" | "barbecue" | "chain";
  categoryLabel: string;
  categoryIcon: React.ElementType;
  avatar: string;
  fallbackInitials: string;
  benefitBadge: string;
  benefitCategory: "turnover" | "commission" | "reviews" | "hotel" | "whatsapp";
  metricHighlight: string;
  metricLabel: string;
  quote: string;
  fullStory: string;
  operationalDetails: {
    tables: string;
    kdsStations: string;
    avgGuestsDaily: string;
    primaryModules: string[];
  };
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "sanjeev-malabar",
    name: "Chef Sanjeev Nambiar",
    role: "Executive Chef & Co-Owner",
    restaurant: "The Malabar Coast",
    city: "Fort Kochi & Bengaluru",
    category: "restaurant",
    categoryLabel: "Coastal Fine Dining",
    categoryIcon: UtensilsCrossed,
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&h=160&fit=crop&crop=faces&q=80",
    fallbackInitials: "SN",
    benefitBadge: "⚡ 35% Faster Table Turnover",
    benefitCategory: "turnover",
    metricHighlight: "18 min saved",
    metricLabel: "Per Table Seating",
    quote:
      "Before DineFlow, our peak weekend dinners had 45-minute waitlists and chaotic paper order tickets. With instant table QR ordering and split-station kitchen KDS, our turnover accelerated by 35% and kitchen ticket errors dropped to zero.",
    fullStory:
      "Operating a bustling 38-table coastal dining room meant stewards were constantly running between dining zones and the kitchen pass. DineFlow's course-by-course kitchen ticket routing completely streamlined our line cooks. Guests scan, order appetizers immediately, and order refills without waiting for a server. Our table turnover dropped from 65 to 47 minutes during peak rush.",
    operationalDetails: {
      tables: "38 Dining Tables",
      kdsStations: "2 Kitchen KDS Screens",
      avgGuestsDaily: "240+ Guests / Day",
      primaryModules: ["Contactless QR Menu", "Multi-Station KDS", "Sommelier Wine Pairing"],
    },
  },
  {
    id: "meera-roast-bloom",
    name: "Meera Singhania",
    role: "Founder & Managing Director",
    restaurant: "Roast & Bloom Artisan Café",
    city: "Bandra, Mumbai",
    category: "cafe",
    categoryLabel: "Specialty Café & Roastery",
    categoryIcon: Coffee,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces&q=80",
    fallbackInitials: "MS",
    benefitBadge: "💰 ₹1.45L Saved Monthly in Commissions",
    benefitCategory: "commission",
    metricHighlight: "0% Commission",
    metricLabel: "Direct Table & Takeaway Orders",
    quote:
      "We used to surrender 28% of our revenue to third-party delivery aggregators. With DineFlow's direct QR menu and WhatsApp digital bills, our loyal customers order directly with zero commission cuts.",
    fullStory:
      "In a high-rent neighborhood like Bandra, margin preservation is everything. By printing DineFlow acrylic QR stands on our 22 café tables and offering seamless UPI payments, 85% of our guests now re-order directly through our branded DineFlow page. We save nearly ₹1,45,000 every single month in third-party commissions.",
    operationalDetails: {
      tables: "22 Café Tables",
      kdsStations: "1 Barista KDS Screen",
      avgGuestsDaily: "180+ Guests / Day",
      primaryModules: ["WhatsApp Digital Bills", "Loyalty Coupon Tray", "0% Commission Orders"],
    },
  },
  {
    id: "aditya-royal-haveli",
    name: "Aditya Vardhan Rathore",
    role: "Director of Hospitality",
    restaurant: "The Royal Haveli Suites & Dining",
    city: "Jaipur, Rajasthan",
    category: "hotel",
    categoryLabel: "Heritage Hotel & Luxury Suites",
    categoryIcon: Hotel,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&h=160&fit=crop&crop=faces&q=80",
    fallbackInitials: "AR",
    benefitBadge: "🛎️ 2.4x In-Room Dining Volume",
    benefitCategory: "hotel",
    metricHighlight: "2.4x Orders",
    metricLabel: "In-Room Dining Volume",
    quote:
      "Guests scan one bedside QR stand for 24/7 room service, extra towels, and butler assistance. Everything flows straight into their room folio billing without front-desk telephone congestion.",
    fullStory:
      "Our 45 luxury guest suites previously relied on traditional printed binders that were frequently outdated. With DineFlow Hotel PMS & In-Room Dining, guests browse appetizing high-res photos on their phones and order late-night dining or request fresh amenities in 10 seconds. Room dining ticket volume skyrocketed by 240%.",
    operationalDetails: {
      tables: "45 Suites & 26 Restaurant Tables",
      kdsStations: "3 Multi-Station KDS Screens",
      avgGuestsDaily: "310+ Guests / Day",
      primaryModules: ["In-Room QR Butler", "Room Folio Billing", "Housekeeping DND"],
    },
  },
  {
    id: "kavita-aura-skyline",
    name: "Kavita Chawla",
    role: "General Manager",
    restaurant: "Aura Skyline Rooftop & Lounge",
    city: "Aerocity, New Delhi",
    category: "restaurant",
    categoryLabel: "High-Energy Rooftop & Bar",
    categoryIcon: Flame,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=faces&q=80",
    fallbackInitials: "KC",
    benefitBadge: "⭐ 4.9★ Google Rating Automated",
    benefitCategory: "reviews",
    metricHighlight: "4.9 ★",
    metricLabel: "+480 Reviews in 60 Days",
    quote:
      "The AI Smart Review QR Stand at our host desk is pure gold. Guests scan before leaving, our 5-star ratings shot up to 4.9 on Google Maps, and private feedback shielded our staff from public complaints.",
    fullStory:
      "In fine dining and cocktail lounges, Google Maps reputation drives over 60% of weekend footfall. DineFlow's AI Review Stand generates 3 authentic positive review drafts for happy diners to copy with 1 tap, while unhappy guests are directed to a private manager feedback form. Our rating jumped from 4.3 to 4.9 in two months.",
    operationalDetails: {
      tables: "60 Lounge Tables",
      kdsStations: "2 Bar & Kitchen KDS",
      avgGuestsDaily: "450+ Guests / Day",
      primaryModules: ["AI Google Review Stand", "Private Feedback Shield", "Live Table Waitlist"],
    },
  },
  {
    id: "vikram-fire-wood",
    name: "Vikramaditya Bose",
    role: "Proprietor & Food Director",
    restaurant: "Fire & Wood Smokehouse",
    city: "Indiranagar, Bengaluru",
    category: "barbecue",
    categoryLabel: "Craft Barbecue & Gastropub",
    categoryIcon: UtensilsCrossed,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces&q=80",
    fallbackInitials: "VB",
    benefitBadge: "📈 42% More Drink & Dessert Upsells",
    benefitCategory: "turnover",
    metricHighlight: "+₹320 AOV",
    metricLabel: "Higher Average Order Value",
    quote:
      "The visual menu with AI smart recommendations automatically nudges guests to add craft beers and smoked dessert pairings. Our average check size increased by ₹320 in the very first month.",
    fullStory:
      "Human servers often forget to upsell appetizers or beverage pairings when the dining room is slammed. DineFlow's smart menu displays high-margin add-ons right as the guest adds a main course to their cart. Our craft cocktail and dessert sales surged by 42% within 3 weeks of going live.",
    operationalDetails: {
      tables: "42 Dining Tables",
      kdsStations: "2 Smoker & Grill KDS",
      avgGuestsDaily: "290+ Guests / Day",
      primaryModules: ["AI Smart Menu Writer", "Automated Upsell Nudges", "Split Bill Settlement"],
    },
  },
  {
    id: "zoya-spice-route",
    name: "Zoya Merchant",
    role: "Co-Founder & COO",
    restaurant: "Spice Route Bistro Group",
    city: "Hyderabad & Pune",
    category: "chain",
    categoryLabel: "Multi-Outlet Bistro Group",
    categoryIcon: Building2,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces&q=80",
    fallbackInitials: "ZM",
    benefitBadge: "📱 100% WhatsApp Bill Delivery",
    benefitCategory: "whatsapp",
    metricHighlight: "₹36k Saved",
    metricLabel: "Monthly Thermal Paper Eliminated",
    quote:
      "Thermal paper rolls used to cost us ₹12,000 every month per outlet. DineFlow sends instant branded GST tax invoices on WhatsApp with a direct payment link. Our checkout speed doubled.",
    fullStory:
      "Managing 3 busy restaurant branches meant continuous receipt printer jams and thermal roll expenses. DineFlow's WhatsApp billing gateway delivers an itemized digital GST bill straight to the diner's mobile number. Our cashier turnaround is instantaneous, and we captured an opt-in CRM list of 18,000 diners.",
    operationalDetails: {
      tables: "85 Tables Across 3 Outlets",
      kdsStations: "5 Multi-Branch KDS Screens",
      avgGuestsDaily: "680+ Guests / Day",
      primaryModules: ["WhatsApp GST Invoices", "Multi-Branch Reporting", "Staff Attendance Clock-In"],
    },
  },
];

const BENEFIT_FILTERS = [
  { id: "all", label: "All Stories" },
  { id: "turnover", label: "⚡ 35% Faster Turnover" },
  { id: "commission", label: "💰 0% Commission Direct" },
  { id: "reviews", label: "⭐ 4.9★ Google Reviews" },
  { id: "hotel", label: "🛎️ Hotel In-Room Dining" },
  { id: "whatsapp", label: "📱 WhatsApp Digital Bills" },
];

export function LandingTestimonials() {
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
  const [activeModalItem, setActiveModalItem] = React.useState<TestimonialItem | null>(null);
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const sectionRef = React.useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll Parallax calculation for background glow & floating metrics
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ambientGlowY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-30, 30]
  );

  const parallaxBadgeY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [20, -20]
  );

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Duplicate items array for continuous, seamless right-to-left infinite marquee
  const marqueeItems = React.useMemo(() => {
    return [...TESTIMONIALS, ...TESTIMONIALS];
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative w-full py-12 sm:py-16 bg-transparent scroll-mt-24 overflow-hidden"
    >
      {/* ── Parallax Background Ambient Glow ── */}
      <motion.div
        style={{ y: ambientGlowY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-8">
        {/* ── Section Header with Parallax Float ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3 max-w-2xl">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Real Hospitality Results</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Trusted by 850+ restaurants, cafés & luxury resorts
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Discover how operators eliminate commission fees, accelerate table turnover, and delight guests with DineFlow.
            </p>
          </div>

          {/* Floating Parallax Social Proof Badge */}
          <motion.div
            style={{ y: parallaxBadgeY }}
            className="hidden md:flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/30 shrink-0"
          >
            <div className="flex items-center -space-x-2">
              {TESTIMONIALS.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-800 shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(item.id)}
                  />
                </div>
              ))}
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  ))}
                </div>
                <span>4.9 / 5</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                1,200+ Dining Tables Live
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Interactive Benefit Filter Chips ── */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BENEFIT_FILTERS.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm"
                    : "bg-white/80 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Floating Continuous Right-to-Left Marquee Container ── */}
      <div className="group-marquee relative w-full overflow-hidden py-4 select-none">
        {/* Left & Right Smooth Edge Fade Masks */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-slate-50 via-slate-50/90 dark:from-[#090D16] dark:via-[#090D16]/90 to-transparent z-20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-slate-50 via-slate-50/90 dark:from-[#090D16] dark:via-[#090D16]/90 to-transparent z-20"
          aria-hidden="true"
        />

        {/* Floating Marquee Rail: Pauses smoothly when hovered */}
        <div className="flex items-stretch gap-5 w-max animate-marquee-left">
          {marqueeItems.map((item, index) => {
            const isHighlighted =
              selectedFilter === "all" || selectedFilter === item.benefitCategory;
            const CategoryIcon = item.categoryIcon;
            const hasError = imageErrors[`${item.id}-${index}`] || imageErrors[item.id];

            return (
              <div
                key={`${item.id}-${index}`}
                onClick={() => setActiveModalItem(item)}
                className={`w-[340px] sm:w-[410px] shrink-0 rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md border overflow-hidden ${
                  isHighlighted
                    ? "bg-white/90 dark:bg-slate-900/85 border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/30 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:border-emerald-500/50 hover:-translate-y-1.5"
                    : "opacity-45 grayscale bg-white/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50"
                }`}
              >
                {/* Card Top: Owner Avatar, Name, Role & 5-Star Rating */}
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Photo Avatar with verified pulse ring */}
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700/80 shadow-inner">
                        {!hasError ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(item.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-gradient-to-tr from-emerald-600 to-teal-500 text-white">
                            {item.fallbackInitials}
                          </div>
                        )}
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
                          title="Verified Dining Partner"
                        />
                      </div>

                      {/* Name & Title */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.role}
                        </p>
                      </div>
                    </div>

                    {/* 5-Star Rating Badge — ALWAYS contained, solid, and never breaking */}
                    <div className="flex items-center gap-0.5 text-amber-400 shrink-0 px-2 py-1 rounded-lg bg-amber-400/10 dark:bg-amber-400/15 border border-amber-400/20 whitespace-nowrap shadow-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      ))}
                    </div>
                  </div>

                  {/* Restaurant Venue & City (Dedicated full-width row) */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3 min-w-0">
                    <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.restaurant}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal shrink-0">
                      • {item.city}
                    </span>
                  </div>

                  {/* Benefit Pill Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-tight">
                      {item.benefitBadge}
                    </span>
                  </div>

                  {/* Testimonial Quote */}
                  <div className="relative">
                    <Quote className="w-5 h-5 text-slate-300 dark:text-slate-700 absolute -top-1 -left-1 opacity-40 pointer-events-none" />
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3 pl-3 italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Metric Highlight & Operational specs */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                      {item.metricHighlight}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                      {item.metricLabel}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    <span>Full Story</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Interactive Case Study Modal / Quick View ── */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-6 animate-in zoom-in-95 duration-200"
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header: Owner & Restaurant */}
            <div className="flex items-center gap-4 pr-8">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeModalItem.avatar}
                  alt={activeModalItem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {activeModalItem.name}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeModalItem.role}
                </p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {activeModalItem.restaurant} • {activeModalItem.city}
                </p>
                <div className="flex items-center gap-1 text-amber-400 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 ml-1">
                    5.0 Verified Dining Partner
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Banner */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Key Transformation
                </span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeModalItem.benefitBadge}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {activeModalItem.metricHighlight}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeModalItem.metricLabel}
                </div>
              </div>
            </div>

            {/* Full Story Quote */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Full Operator Story
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeModalItem.fullStory}
              </p>
            </div>

            {/* Operational Setup Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Live Restaurant Configuration
              </span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {activeModalItem.operationalDetails.tables}
                  </span>
                  <span className="text-[10px] text-slate-400">Capacity</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {activeModalItem.operationalDetails.kdsStations}
                  </span>
                  <span className="text-[10px] text-slate-400">Kitchen Display</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {activeModalItem.operationalDetails.avgGuestsDaily}
                  </span>
                  <span className="text-[10px] text-slate-400">Volume</span>
                </div>
              </div>

              {/* Active Modules Pills */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {activeModalItem.operationalDetails.primaryModules.map((mod, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700/60 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{mod}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
