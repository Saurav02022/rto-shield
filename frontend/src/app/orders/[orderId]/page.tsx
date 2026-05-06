import Link from "next/link";
import { notFound } from "next/navigation";

import { OutcomeBadge } from "@/components/orders/OutcomeBadge";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BackendError } from "@/lib/api";
import { getOrder } from "@/lib/orders-server";
import { formatCurrency, formatDateTime } from "@/utils/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;

  let order;
  try {
    order = await getOrder(orderId);
  } catch (error) {
    if (error instanceof BackendError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Orders
        </Link>
        <span>›</span>
        <span className="font-mono text-foreground">{order.id}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {order.customer_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {order.product_summary} · {formatCurrency(order.order_value)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Order details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <KV label="Phone" value={order.phone} mono />
            <KV label="Address" value={order.address_short} />
            <KV label="Slot" value={order.scheduled_slot} />
            <KV label="Brand" value={order.brand_name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last call</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-[140px_1fr] gap-2">
              <span className="text-xs uppercase text-muted-foreground">Outcome</span>
              <OutcomeBadge outcome={order.last_call_outcome} />
            </div>
            <KV label="Call ID" value={order.last_call_id} mono />
            <KV label="Updated" value={formatDateTime(order.updated_at)} />
          </CardContent>
        </Card>
      </div>

      {order.last_summary ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{order.last_summary}</p>
          </CardContent>
        </Card>
      ) : null}

      {order.last_transcript_url ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
              {order.last_transcript_url}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {(order.captured_address_landmark ||
        order.captured_new_slot ||
        order.captured_cancel_reason ||
        order.captured_followup_question) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Captured fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <KV label="Landmark" value={order.captured_address_landmark} />
            <KV label="New slot" value={order.captured_new_slot} />
            <KV label="Cancel reason" value={order.captured_cancel_reason} />
            <KV label="Followup question" value={order.captured_followup_question} />
          </CardContent>
        </Card>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">
        Created {formatDateTime(order.created_at)}
      </p>
    </main>
  );
}

function KV({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm" : "text-sm"}>
        {value || <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  );
}
