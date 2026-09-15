import React from "react";
import {
  BaseStyles,
  Button,
  FormControl,
  Header,
  Heading,
  IconButton,
  Label,
  PageLayout,
  ProgressBar,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeProvider,
  Tooltip,
} from "@primer/react";
import { Card } from "@primer/react/experimental";
import PrimerInput from "../PrimerInput";
import PrimerSelect from "../PrimerSelect";

export { BaseStyles, Card, FormControl, Header, Heading, IconButton, Label, PageLayout, ProgressBar, Select, Stack, Text, TextInput, ThemeProvider, Tooltip };
export { PrimerInput, PrimerSelect };
export const PrimerButton = Button;

export function PrimerPanel({ children, className = "", ...props }) {
  return (
    <Card
      {...props}
      className={className}
      sx={{
        backgroundColor: "canvas.default",
        ...props.sx,
      }}
    >
      {children}
    </Card>
  );
}

export function PrimerField({ label, caption, children, ...props }) {
  return (
    <FormControl {...props}>
      {label && <FormControl.Label>{label}</FormControl.Label>}
      {children}
      {caption && <FormControl.Caption>{caption}</FormControl.Caption>}
    </FormControl>
  );
}

export function PrimerStatus({ children, variant = "default" }) {
  const color = variant === "success" ? "fg.success" : variant === "danger" ? "fg.danger" : "fg.muted";
  return <Text sx={{ color, fontSize: 1, fontWeight: "bold" }}>{children}</Text>;
}
