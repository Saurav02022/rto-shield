import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
      <Button type="button">Button</Button>
    </div>
  );
}
