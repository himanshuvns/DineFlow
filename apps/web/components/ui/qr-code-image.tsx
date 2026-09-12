"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

interface QRCodeImageProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  alt?: string;
}

export function QRCodeImage({
  value,
  size = 200,
  className = "",
  darkColor = "#0f172a",
  lightColor = "#ffffff",
  alt = "QR Code",
}: QRCodeImageProps) {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    let isCancelled = false;

    if (!value) {
      setDataUrl(null);
      return;
    }

    QRCode.toDataURL(value, {
      width: size * 2, // 2x for sharp retina rendering
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!isCancelled) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate QR code", err);
        if (!isCancelled) {
          setError(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [value, size, darkColor, lightColor]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl text-xs text-center p-2 border border-rose-200"
      >
        Failed to generate QR
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-slate-100 rounded-xl animate-pulse"
      >
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={`block object-contain select-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
