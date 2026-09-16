export function getLabelIconPath(type, value) {
  const iconName = value ? value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "none";
  return `assets/icons/${type}-labels/${iconName || "none"}.svg`;
}

export function createLabelIcon(option, type) {
  if (!type) return null;

  const icon = document.createElement("img");
  icon.className = "type-label-icon";
  icon.src = getLabelIconPath(type, option.value);
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  icon.addEventListener("error", () => icon.remove());
  return icon;
}
