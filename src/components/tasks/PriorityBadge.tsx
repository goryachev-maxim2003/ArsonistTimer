import type { Priority } from "../../types/models";
import { Badge } from "../ui/Badge";

const tones: Record<Priority, "muted" | "default" | "primary" | "danger"> = {
  low: "muted",
  medium: "default",
  high: "primary",
  urgent: "danger",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={tones[priority]}>{priority}</Badge>;
}
