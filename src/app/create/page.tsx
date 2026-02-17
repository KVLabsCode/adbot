"use client";

import { useRouter } from "next/navigation";
import { LaunchFlow } from "@/components/studio/LaunchFlow";

export default function CreatePage() {
  const router = useRouter();
  return <LaunchFlow onClose={() => router.push("/campaigns")} />;
}
