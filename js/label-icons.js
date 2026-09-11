const iconDirectories = {
  phone: "assets/icons/phone-labels",
  address: "assets/icons/address-labels",
};

export function getLabelIconPath(type, value) {
  const iconName = value ? value.toLowerCase() : "none";
  const directory = iconDirectories[type];
  return directory ? `${directory}/${iconName}.svg` : null;
}

export function createLabelIcon(option) {
  if (!option.icon) return null;

  const icon = document.createElement("img");
  icon.className = "type-label-icon";
  icon.src = option.icon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  icon.addEventListener("error", () => icon.remove());
  return icon;
}
