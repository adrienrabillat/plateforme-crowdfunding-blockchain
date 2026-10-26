"use client";

export function getCategoryIcon(title: string): string {
  if (title.toLowerCase().includes("résidence") || title.toLowerCase().includes("immobil"))
    return "building";
  if (title.toLowerCase().includes("biotech") || title.toLowerCase().includes("pme") || title.toLowerCase().includes("startup"))
    return "briefcase";
  return "star";
}

export function getCategoryGradient(title: string): string {
  if (title.toLowerCase().includes("résidence") || title.toLowerCase().includes("immobil"))
    return "bg-pastel-lavender";
  if (title.toLowerCase().includes("biotech") || title.toLowerCase().includes("pme") || title.toLowerCase().includes("startup"))
    return "bg-pastel-peach";
  return "bg-pastel-mint";
}

// Helper to render SVG icons for categories
export function renderCategoryIcon(type: string, size: "sm" | "md" | "lg" = "md") {
  const sizeClass = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size];

  const iconColor = {
    building: "text-lavender-dark",
    briefcase: "text-peach-dark",
    star: "text-mint-dark",
  }[type] || "text-text-secondary";

  const baseClass = `${sizeClass} ${iconColor}`;

  if (type === "building") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }

  if (type === "briefcase") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }

  return (
    <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
