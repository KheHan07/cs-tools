import { Card, Stack, Typography } from "@wso2/oxygen-ui";

export function Comment({ children, author, timestamp }: { children: string; author: string; timestamp: string }) {
  return (
    <Card component={Stack} p={1} gap={1.5} sx={{ bgcolor: "background.default" }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" fontWeight="medium">
          {author}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {timestamp}
        </Typography>
      </Stack>
      <Typography variant="body2">{children}</Typography>
    </Card>
  );
}
