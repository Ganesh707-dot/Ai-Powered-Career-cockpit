import { Suspense } from "react";
import { SiteAccessForm } from "./site-access-form";

export default function SiteAccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SiteAccessForm />
    </Suspense>
  );
}
