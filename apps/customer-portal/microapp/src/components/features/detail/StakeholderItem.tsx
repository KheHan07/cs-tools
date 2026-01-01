import { Person } from "@mui/icons-material";
import { Card, Stack, Typography } from "@mui/material";

export function StakeholderItem({ name, role }: { name: string; role: string }) {
  return (
    <Card
      component={Stack}
      direction="row"
      justifyContent="space-between"
      elevation={0}
      p={1}
      sx={{ bgcolor: "background.card" }}
    >
      <Stack direction="row" gap={1}>
        <Person sx={{ color: "text.secondary" }} />
        <Typography variant="body1" fontWeight="medium">
          {name}
        </Typography>
      </Stack>
      <Typography variant="body2" fontWeight="regular" color="text.secondary">
        {role}
      </Typography>
    </Card>
  );
}
