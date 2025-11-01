import { createFileRoute } from "@tanstack/react-router";
import { NotFoundComponent } from "~/components/error-component";

export const Route = createFileRoute("/placeholder")({
  component: NotFoundComponent,
});
