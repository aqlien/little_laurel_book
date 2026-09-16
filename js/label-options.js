import { getLabelIconPath } from "./label-icons.js";

export const phoneLabels = [
  { value: "", text: "No label", icon: getLabelIconPath("phone", "") },
  { value: "Home", text: "Home", icon: getLabelIconPath("phone", "Home") },
  { value: "Work", text: "Work", icon: getLabelIconPath("phone", "Work") },
  { value: "Mobile", text: "Mobile", icon: getLabelIconPath("phone", "Mobile") },
];

export const addressLabels = [
  { value: "", text: "No label", icon: getLabelIconPath("address", "") },
  { value: "Home", text: "Home", icon: getLabelIconPath("address", "Home") },
  { value: "Work", text: "Work", icon: getLabelIconPath("address", "Work") },
  { value: "Other", text: "Other", icon: getLabelIconPath("address", "Other") },
];

export const dateLabels = [
  { value: "Birthday", text: "Birthday" },
  { value: "Anniversary", text: "Anniversary" },
];

export const numberLabels = [
  { value: "SSN", text: "SSN" },
  { value: "KTN", text: "KTN" },
  { value: "Global Entry ID", text: "Global Entry ID" },
];
