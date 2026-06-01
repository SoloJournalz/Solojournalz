import { Suspense } from "react";
import PageLoading from "@/app/components/layout/page-loading";
import SetupClient from "./setup-client";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SetupClient />
    </Suspense>
  );
}
