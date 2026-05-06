import { Badge } from "@/components/ui/badge";
import { getOutcomeTagLabel, getOutcomeTagVariant } from "@/constants/orderStatus";

type Props = {
  outcome: string | null | undefined;
};

export function OutcomeBadge({ outcome }: Props) {
  const label = getOutcomeTagLabel(outcome);
  if (!label) return <span className="text-muted-foreground">—</span>;

  return <Badge variant={getOutcomeTagVariant(outcome)}>{label}</Badge>;
}
