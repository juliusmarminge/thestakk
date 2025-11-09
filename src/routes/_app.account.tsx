import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { passkeysQueryOptions } from "~/auth/client";
import { ErrorComponent } from "~/components/error-component";
import {
  AddPasskeyDialog,
  PasskeyListSkeleton,
  PasskeysList,
} from "~/components/passkeys";
import { Heading, Subheading, Text } from "~/components/ui/text";

export const Route = createFileRoute("/_app/account")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(passkeysQueryOptions);
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Heading>Account</Heading>
          <Text>Manage your account settings</Text>
        </div>

        <div className="flex flex-col gap-6 px-4 lg:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Subheading>Passkeys</Subheading>
                <Text>Manage your passkeys</Text>
              </div>
              <AddPasskeyDialog />
            </div>
            <Suspense fallback={<PasskeyListSkeleton />}>
              <PasskeysList />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
