import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/cases/$id")({
  head: () => ({ meta: [{ title: "Case Detail" }] }),
  component: () => (
    <div className="p-10 text-center">
      <div className="text-2xl text-marble">Case detail</div>
    </div>
  ),
});
