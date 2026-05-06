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
import { cn } from "@/lib/utils";
import type { OrderResponse } from "@/types/api";

type Props = {
  order: OrderResponse | null;
  open: boolean;
  isRefreshing: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
};

export function DetailDialog({ order, open, onOpenChange, onRefresh, isRefreshing }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          // Override base dialog `sm:max-w-sm` so detail view can use full width on small screens and 2xl on md+.
          "flex w-[min(100vw-1.5rem,42rem)] max-w-[min(100vw-1.5rem,42rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
          "h-[min(90dvh,44rem)] max-h-[min(90dvh,44rem)]",
        )}
      >
        {order ? (
          <>
            <div className="shrink-0 border-b px-4 pt-4 pb-3 pr-12">
              <DialogHeader className="gap-2 text-left">
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm">{order.id}</span>
                  <StatusBadge status={order.status} />
                </DialogTitle>
                <DialogDescription className="text-pretty">
                  {order.customer_name} · {order.product_summary} · {formatCurrency(order.order_value)}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
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
                <KeyValue label="Captured landmark" value={order.captured_address_landmark} />
                <KeyValue label="Captured slot" value={order.captured_new_slot} />
                <KeyValue label="Cancel reason" value={order.captured_cancel_reason} />
                <KeyValue label="Followup question" value={order.captured_followup_question} />

                {order.last_summary ? (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Summary</p>
                      <p className="mt-1 text-sm leading-relaxed text-pretty">{order.last_summary}</p>
                    </div>
                  </>
                ) : null}

                {order.last_transcript_url ? (
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Transcript</p>
                    <pre className="mt-2 max-h-72 overflow-auto rounded-lg border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-words">
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
                    Open recording <ExternalLink className="size-3 shrink-0" aria-hidden />
                  </a>
                ) : null}

                <Separator />
                <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:grid sm:grid-cols-2 sm:gap-2">
                  <span>Created {formatDateTime(order.created_at)}</span>
                  <span className="sm:text-right">Updated {formatDateTime(order.updated_at)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 rounded-none border-t bg-muted/30 px-4 py-3 sm:justify-end">
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
    <div className="grid gap-2 sm:grid-cols-[minmax(0,8.75rem)_1fr] sm:items-start">
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      <div className="min-w-0">
        {valueEl ? (
          <span>{valueEl}</span>
        ) : (
          <span className={mono ? "font-mono text-sm break-words" : "text-sm break-words"}>
            {value || <span className="text-muted-foreground">—</span>}
          </span>
        )}
      </div>
    </div>
  );
}
