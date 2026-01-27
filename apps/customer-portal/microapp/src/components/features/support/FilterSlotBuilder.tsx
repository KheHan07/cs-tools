import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SearchBar, Stack, Tab, Tabs } from "@wso2/oxygen-ui";
import type { NotificationFilter } from "@pages/NotificationsPage";
import type { Status } from "./ItemCard";

export interface FilterTab {
  label: string;
  value: Status | NotificationFilter | "all";
}

export interface FilterSlotBuilderProps {
  tabs: FilterTab[];
  searchPlaceholder?: string;
}

export function FilterSlotBuilder({ tabs, searchPlaceholder }: FilterSlotBuilderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const searchParamName = "search",
    filterParamName = "filter";

  const baseRoute = location.pathname;
  const activeFilter = searchParams.get(filterParamName) ?? "all";
  const searchValue = searchParams.get(searchParamName) ?? "";

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    navigate(`${baseRoute}?${next.toString()}`, { replace: true });
  };

  return (
    <Stack gap={2} pb={1}>
      <SearchBar
        size="small"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => updateParams({ [searchParamName]: e.target.value || null })}
        sx={{
          mt: 1,
          bgcolor: "background.paper",
        }}
        fullWidth
      />
      <Tabs
        value={activeFilter}
        scrollButtons={false}
        variant="scrollable"
        onChange={(_, value) => updateParams({ [filterParamName]: value })}
      >
        <Tab label="All" value="all" disableRipple />
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} value={tab.value} disableRipple />
        ))}
      </Tabs>
    </Stack>
  );
}
