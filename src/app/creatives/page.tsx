"use client";

import { useRouter } from "next/navigation";
import { CreativeStudio } from "@/components/creative/CreativeStudio";

export default function CreativesPage() {
  const router = useRouter();
  return <CreativeStudio onClose={() => router.push("/chat")} standalone />;
}
