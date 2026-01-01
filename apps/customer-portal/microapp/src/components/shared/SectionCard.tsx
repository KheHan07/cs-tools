import type { ReactNode } from "react";
import { Card, Stack, Typography } from "@mui/material";

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card component={Stack} p={1.5} gap={1.5} elevation={0}>
      <Typography variant="h5" fontWeight="medium">
        {title}
      </Typography>
      {children}
    </Card>
  );
}
