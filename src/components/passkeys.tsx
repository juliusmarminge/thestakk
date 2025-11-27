import { PlusIcon } from "@heroicons/react/16/solid";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { Passkey } from "better-auth/plugins/passkey";
import { useState } from "react";
import { toast } from "sonner";
import { authClient, passkeysQueryOptions } from "~/auth/client";
import { PasskeyIcon } from "~/components/icons";
import { Button, LoadingButton } from "~/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useAppForm } from "~/lib/use-form";
import { cn } from "~/lib/utils";

export function AddPasskeyDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const qc = useQueryClient();
  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      const passkey = await authClient.passkey.addPasskey({ name: value.name });
      if (passkey?.error) {
        toast.error(passkey.error.message);
      } else {
        await qc.invalidateQueries(passkeysQueryOptions);
        toast.success("Passkey created");
        setIsOpen(false);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <PlusIcon className="size-4" />
        Create Passkey
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Create a Passkey</DialogTitle>
        </DialogHeader>
        <form.Form form={form} className="flex flex-col gap-4">
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField
                placeholder="Passkey name"
                label="Name"
                description="Name to identify the passkey in the UI"
              />
            )}
          />
          <form.SubscribeButton>Create passkey</form.SubscribeButton>
        </form.Form>
      </DialogPopup>
    </Dialog>
  );
}

function PasskeyItem({ passkey }: { passkey: Passkey }) {
  const qc = useQueryClient();
  const { mutate: deletePasskey, isPending } = useMutation({
    mutationFn: () => authClient.passkey.deletePasskey({ id: passkey.id }),
    onSuccess: async () => {
      await qc.invalidateQueries(passkeysQueryOptions);
      toast.success("Passkey deleted");
    },
  });
  return (
    <li key={passkey.id} className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <PasskeyIcon className="size-5" />
        <div>
          <p className="font-medium">{passkey.name}</p>
          <p className="text-muted-foreground text-sm">
            Created {passkey.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>
      <LoadingButton variant="ghost" onClick={() => deletePasskey()} isLoading={isPending}>
        Delete
      </LoadingButton>
    </li>
  );
}

function PasskeyItemSkeleton(props: { pulse?: boolean }) {
  return (
    <li className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <PasskeyIcon className="size-5" />
        <div className="flex flex-col gap-2">
          <p
            className={cn("h-5 w-20 rounded-md bg-muted", props.pulse !== false && "animate-pulse")}
          />
          <p
            className={cn("h-4 w-16 rounded-md bg-muted", props.pulse !== false && "animate-pulse")}
          />
        </div>
      </div>
      <div
        className={cn("h-5 w-16 rounded-md bg-muted", props.pulse !== false && "animate-pulse")}
      />
    </li>
  );
}

export function PasskeysList() {
  const { data: passkeys } = useSuspenseQuery(passkeysQueryOptions);

  if (passkeys.length === 0) {
    return (
      <ul className="relative divide-y divide-border rounded-lg border">
        <PasskeyItemSkeleton pulse={false} />
        <PasskeyItemSkeleton pulse={false} />
        <PasskeyItemSkeleton pulse={false} />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No passkeys found</p>
        </div>
      </ul>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border">
      {passkeys.map((passkey) => (
        <PasskeyItem key={passkey.id} passkey={passkey} />
      ))}
    </ul>
  );
}

export function PasskeyListSkeleton() {
  return (
    <ul className="divide-y divide-border rounded-lg border">
      <PasskeyItemSkeleton pulse={true} />
      <PasskeyItemSkeleton pulse={true} />
      <PasskeyItemSkeleton pulse={true} />
    </ul>
  );
}
