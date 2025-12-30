import { Stack, Typography, Divider, ButtonBase as Button } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface ItemListViewProps {
  title: string;
  viewAllPath: string;
  children: ReactNode;
}

export function ItemListView({ title, viewAllPath, children }: ItemListViewProps) {
  return (
    <>
      <Stack direction="row" justifyContent="space-between" pb={1}>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Button component={Link} to={viewAllPath} sx={{ padding: 0 }} disableRipple>
          <Stack direction="row" gap={1}>
            <Typography variant="body2" color="primary" fontWeight="medium">
              View All
            </Typography>
            <ChevronRight color="primary" />
          </Stack>
        </Button>
      </Stack>
      <Divider />
      <Stack gap={2} pt={2} divider={<Divider />}>
        {children}
      </Stack>
    </>
  );
}
