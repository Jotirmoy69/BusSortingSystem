import React from "react";
import { TextInput } from "@primer/react";

const nativeTypes = new Set([
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "file",
  "hidden",
  "month",
  "radio",
  "range",
  "time",
  "week",
]);

export default function PrimerInput({ type = "text", ...props }) {
  if (nativeTypes.has(type)) return <input type={type} {...props} />;
  return <TextInput type={type} {...props} />;
}
