"use client";

import * as React from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  X,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { parseMenuOcrText, ParsedMenuItem } from "@/lib/utils/menu-nlp-engine";
import type { MenuItem } from "@/lib/stores/tenant-data-store";
import { apiClient } from "@/lib/api";

interface MenuUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (items: ParsedMenuItem[]) => void;
  existingItems: MenuItem[];
}

const SAMPLE_INDIAN_MENU_OCR = `
RESTAURANT SIGNATURE SPECIALS
Poha 80/- (V)
Upma 90/- (V)
Chole Bhature ₹180 (V)

NORTH INDIAN CURRIES
Paneer Butter Masala ₹280 (V)
Dal Makhani ₹240 (V)
Kadhai Paneer 290/-
Butter Chicken ₹360 (NV)
Chicken Curry 340/- (NV)
Butter Garlic Naan 75/-
Tandoori Roti 35/-

SOUTH INDIAN DOSA CORNER
Masala Dosa ₹150 (V)
Mysore Masala Dosa 170/-
Onion Tomato Uttapam 160/-
Steamed Idli (2 Pcs) 90/-
Medu Vada 110/-

STREET FOOD & CHAATS
Pani Puri (6 Pcs) ₹60 (V)
Bhel Puri 70/-
Sev Puri 80/-
Pav Bhaji 150/-
Vada Pav 45/-
Paneer Kathi Roll 160/-

CHINESE WOK
Veg Hakka Noodles ₹180
Veg Fried Rice 180/-
Veg Manchurian 210/-
Chilli Paneer Dry 250/-
Chilli Chicken 290/- (NV)

BIRYANI SPECIALS
Hyderabadi Dum Chicken Biryani ₹340 (NV)
Royal Veg Dum Biryani 260/- (V)
Lucknowi Mutton Dum Biryani 440/- (NV)

DESSERTS & BEVERAGES
Warm Gulab Jamun (2 Pcs) ₹80
Kesari Rasmalai 110/-
Matka Kulfi 90/-
Masala Chai 40/-
South Indian Filter Coffee 60/-
Punjabi Sweet Lassi 90/-
`;

export function MenuUploadModal({
  isOpen,
  onClose,
  onExtracted,
  existingItems,
}: MenuUploadModalProps) {
  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  const STEPS = [
    "Uploading menu file…",
    "Detecting layout & splitting pages…",
    "Running Indian OCR & NLP extractor…",
    "Normalizing prices & detecting dietary tags…",
    "Preparing interactive staging review…",
  ];

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setIsProcessing(false);
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ["pdf", "jpg", "jpeg", "png", "webp"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      addToast("error", "Unsupported File", "Please upload a PDF, JPG, PNG, or WEBP file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      addToast("error", "File Too Large", "Maximum supported file size is 25MB.");
      return;
    }
    setSelectedFile(file);
  };

  const startExtraction = async (useSample: boolean = false) => {
    setIsProcessing(true);

    if (useSample) {
      for (let i = 0; i < STEPS.length; i++) {
        setCurrentStepIndex(i);
        await new Promise((r) => setTimeout(r, 400));
      }
      const parsed = parseMenuOcrText(SAMPLE_INDIAN_MENU_OCR, existingItems);
      setIsProcessing(false);
      onClose();
      addToast("info", "Sample Menu Loaded", `Loaded ${parsed.length} sample Indian restaurant dishes.`);
      onExtracted(parsed);
      return;
    }

    if (!selectedFile) {
      setIsProcessing(false);
      return;
    }

    // Convert file to Base64
    setCurrentStepIndex(0); // Uploading & Validating
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(selectedFile);
    });

    setCurrentStepIndex(1); // Splitting & Preparing
    await new Promise((r) => setTimeout(r, 400));

    setCurrentStepIndex(2); // Connecting to Gemini Vision AI
    try {
      let data: any = null;

      // 1. Try Go backend API endpoint (/api/v1/menu/scan) via apiClient
      try {
        const apiRes = await apiClient.post("/menu/scan", {
          imageBase64: base64Data,
          existingItems,
        });
        if (apiRes.data && (apiRes.data.items || apiRes.data.data)) {
          data = apiRes.data;
        }
      } catch (apiErr) {
        console.warn("[menu-upload] apiClient.post('/menu/scan') failed, trying Next.js proxy route:", apiErr);
      }

      // 2. Fallback to Next.js route (/api/menu/scan)
      if (!data || !data.items || data.items.length === 0) {
        const res = await fetch("/api/menu/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            existingItems,
          }),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          let errDetail = `HTTP ${res.status}`;
          try {
            const errData = await res.json();
            errDetail = errData.details || errData.error || errDetail;
          } catch { /* ignore */ }
          if (!data) {
            setIsProcessing(false);
            addToast("error", "AI Extraction Failed", `Gemini API error: ${errDetail}`);
            return;
          }
        }
      }

      setCurrentStepIndex(3); // Normalizing prices & dietary
      await new Promise((r) => setTimeout(r, 350));

      setCurrentStepIndex(4); // Staging dishes
      await new Promise((r) => setTimeout(r, 300));

      const items = data?.items || data?.data || [];
      if (items && items.length > 0) {
        setIsProcessing(false);
        onClose();
        addToast(
          "success",
          "Gemini Vision Extracted",
          `Successfully extracted ${items.length} items from ${selectedFile.name}!`
        );
        onExtracted(items);
        return;
      }
    } catch (err) {
      console.warn("Upload Vision API error:", err);
      setIsProcessing(false);
      addToast(
        "error",
        "Extraction Failed",
        "Could not connect to Gemini Vision AI. Please check your internet connection and try again."
      );
      return;
    }

    // Gemini returned 0 items — show error instead of fake fallback
    setIsProcessing(false);
    addToast(
      "error",
      "No Items Detected",
      "AI could not read menu items from this image. Try a clearer photo or higher resolution image."
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Restaurant Menu"
      description="Upload your physical menu as a PDF document, digital image, or high-res photo. DineFlow will extract, structure, and categorize every dish automatically."
      className="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startExtraction(true)}
            disabled={isProcessing}
            leftIcon={<Sparkles className="h-3.5 w-3.5 text-emerald-500" />}
          >
            Try with Sample Indian Menu
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={() => startExtraction(false)}
              disabled={!selectedFile || isProcessing}
              isLoading={isProcessing}
              leftIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start AI Extraction
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleChange}
          className="hidden"
        />

        {/* Dropzone */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              dragActive
                ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
                : "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-700"
            }`}
          >
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-[#14F1C7] mb-3">
              <UploadCloud className="h-7 w-7" />
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Drag and drop menu file here
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
              Supports multi-page <strong>PDF</strong>, or high-res <strong>PNG, JPG, WEBP</strong> images up to 25MB.
            </p>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                {selectedFile.name.endsWith(".pdf") ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                </p>
              </div>
            </div>

            {!isProcessing && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="space-y-2.5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-[#14F1C7]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                {STEPS[currentStepIndex]}
              </span>
              <span>{Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%</span>
            </div>

            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#14F1C7] transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
