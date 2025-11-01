import { createFileRoute } from "@tanstack/react-router";
import { PanelLeftIcon, PanelRightIcon } from "~/components/icons";
import { ThemePreview } from "~/components/themes";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { useSidebar } from "~/components/ui/sidebar";
import { Heading, Subheading, Text } from "~/components/ui/text";

export const Route = createFileRoute("/_app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { side, setSide } = useSidebar();

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Heading>Settings</Heading>
          <Text>Manage your application preferences and appearance.</Text>
        </div>

        <div className="flex flex-col gap-6 px-4 lg:px-6">
          <div className="space-y-4">
            <div>
              <Subheading>Theme</Subheading>
              <Text>Choose a theme to customize your application.</Text>
            </div>
            <ThemePreview />
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Subheading>Sidebar Position</Subheading>
              <Text>
                You can also right-click the sidebar toggle to change the
                position.
              </Text>
            </div>
            <RadioGroup
              value={side}
              onValueChange={(value) => setSide(value as "left" | "right")}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="left"
                  id="left"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="left"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <PanelLeftIcon />
                  Left Sidebar
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="right"
                  id="right"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="right"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <PanelRightIcon />
                  Right Sidebar
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
