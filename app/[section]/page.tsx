import Tracker from "@/components/tracker";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (
    ![
      "today",
      "helpers",
      "schedules",
      "maintenance",
      "dashboard",
      "history",
    ].includes(section)
  )
    notFound();
  return <Tracker section={section} />;
}
