"use client";

import { Loader2, RefreshCw, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { OutcomeBadge } from "@/components/orders/OutcomeBadge";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { formatCurrency, formatDateTime } from "@/utils/format";
import type { OrderResponse } from "@/types/api";

type Props = {
  order: OrderResponse | null;
  open: boolean;
  isRefreshing: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
};

export function DetailDialog({ order, open, isRefreshing, onOpenChange, onRefresh }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {order ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="font-mono text-sm">{order.id}</span>
                <StatusBadge status={order.status} />
              </DialogTitle>
              <DialogDescription>
                {order.customer_name} · {order.product_summary} · {formatCurrency(order.order_value)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <KeyValue label="Phone" value={order.phone} mono />
              <KeyValue label="Address" value={order.address_short} />
              <KeyValue label="Scheduled slot" value={order.scheduled_slot} />
              <KeyValue label="Brand" value={order.brand_name} />

              <Separator />

              <KeyValue
                label="Last call outcome"
                valueEl={<OutcomeBadge outcome={order.last_call_outcome} />}
              />
              <KeyValue label="Last call ID" value={order.last_call_id} mono />
              <KeyValue
                label="Captured landmark"
                value={order.captured_address_landmark}
              />
              <KeyValue label="Captured slot" value={order.captured_new_slot} />
              <KeyValue label="Cancel reason" value={order.captured_cancel_reason} />
              <KeyValue
                label="Followup question"
                value={order.captured_followup_question}
              />

              {order.last_summary ? (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Summary
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{order.last_summary}</p>
                  </div>
                </>
              ) : null}

              {order.last_transcript_url ? (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Transcript
                  </p>
                  <pre className="mt-1 max-h-64 overflow-auto rounded-lg border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
                    {order.last_transcript_url}
                  </pre>
                </div>
              ) : null}

              {order.last_recording_url ? (
                <a
                  href={order.last_recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                  aria-label={`Open call recording for order ${order.id}`}
                >
                  Open recording <ExternalLink className="size-3" aria-hidden />
                </a>
              ) : null}

              <Separator />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Created {formatDateTime(order.created_at)}</span>
                <span className="text-right">Updated {formatDateTime(order.updated_at)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button size="sm" onClick={onRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <RefreshCw aria-hidden />
                )}
                Refresh from Bolna
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function KeyValue({
  label,
  value,
  valueEl,
  mono = false,
}: {
  label: string;
  value?: string | null;
  valueEl?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      {valueEl ? (
        <span>{valueEl}</span>
      ) : (
        <span className={mono ? "font-mono text-sm" : "text-sm"}>
          {value || <span className="text-muted-foreground">—</span>}
        </span>
      )}
    </div>
  );
}
