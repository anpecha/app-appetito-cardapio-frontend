"use client";

import { useEffect } from "react";
import type { Restaurant } from "@/lib/types";

function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function darkenHsl(hsl: string, amount: number): string {
  const parts = hsl.split(" ").map(Number);
  const l = Math.max(0, parts[2] - amount);
  return `${parts[0]} ${parts[1]}% ${l}%`;
}

function lightenHsl(hsl: string, amount: number): string {
  const parts = hsl.split(" ").map(Number);
  const l = Math.min(100, parts[2] + amount);
  return `${parts[0]} ${parts[1]}% ${l}%`;
}

function isColorLight(hsl: string): boolean {
  const parts = hsl.split(" ").map(Number);
  return parts[2] > 55;
}

const fontMap: Record<string, string> = {
  "Plus Jakarta Sans": "var(--font-plus-jakarta)",
  "Work Sans": "var(--font-work-sans)",
  Inter: "var(--font-inter)",
  Roboto: "var(--font-roboto)",
};

export function useWhiteLabel(restaurant: Restaurant | null) {
  useEffect(() => {
    if (!restaurant) return;

    const root = document.documentElement;

    if (restaurant.primary_color) {
      const primaryHsl = hexToHsl(restaurant.primary_color);
      if (primaryHsl) {
        root.style.setProperty("--action-primary", primaryHsl);
        root.style.setProperty("--action-primary-hover", darkenHsl(primaryHsl, 5));
        root.style.setProperty("--action-primary-active", darkenHsl(primaryHsl, 10));
        root.style.setProperty("--action-primary-subtle", lightenHsl(primaryHsl, 35));

        const isLight = isColorLight(primaryHsl);
        root.style.setProperty(
          "--text-on-brand",
          isLight ? "20 20% 15%" : "0 0% 100%"
        );
      }
    }

    if (restaurant.secondary_color) {
      const secondaryHsl = hexToHsl(restaurant.secondary_color);
      if (secondaryHsl) {
        root.style.setProperty("--action-strong", secondaryHsl);
        root.style.setProperty("--action-strong-hover", darkenHsl(secondaryHsl, 5));
        root.style.setProperty("--action-strong-active", darkenHsl(secondaryHsl, 10));
      }
    }

    if (restaurant.font_family && fontMap[restaurant.font_family]) {
      root.style.setProperty("--font-display", fontMap[restaurant.font_family]);
    }

    return () => {
      root.style.removeProperty("--action-primary");
      root.style.removeProperty("--action-primary-hover");
      root.style.removeProperty("--action-primary-active");
      root.style.removeProperty("--action-primary-subtle");
      root.style.removeProperty("--text-on-brand");
      root.style.removeProperty("--action-strong");
      root.style.removeProperty("--action-strong-hover");
      root.style.removeProperty("--action-strong-active");
      root.style.removeProperty("--font-display");
    };
  }, [restaurant]);
}
