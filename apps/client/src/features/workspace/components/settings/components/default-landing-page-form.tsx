import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, TextInput, Text, Stack } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useAtom } from "jotai";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import { workspaceAtom } from "@/features/user/atoms/current-user-atom.ts";
import { updateWorkspace } from "@/features/workspace/services/workspace-service";
import { useUserRole } from "@/hooks/use-user-role";
import { IWorkspace } from "@/features/workspace/types/workspace.types";

const formSchema = z.object({
    defaultLandingPage: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DefaultLandingPageForm() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [workspace, setWorkspace] = useAtom(workspaceAtom);
    const { isAdmin } = useUserRole();

    // Don't render if the feature is not available (migration not applied)
    if (workspace && !('defaultLandingPage' in workspace)) {
        return null;
    }

    const form = useForm<FormValues>({
        validate: zodResolver(formSchema),
        initialValues: {
            defaultLandingPage: workspace?.defaultLandingPage || "",
        },
    });

    async function handleSubmit(data: FormValues) {
        setIsLoading(true);

        try {
            const updatedWorkspace = await updateWorkspace({
                defaultLandingPage: data.defaultLandingPage
            });
            setWorkspace(updatedWorkspace);
            notifications.show({ message: t("Default landing page updated successfully") });
        } catch (err) {
            console.log(err);
            notifications.show({
                message: t("Failed to update default landing page"),
                color: "red",
            });
        }
        setIsLoading(false);
        form.resetDirty();
    }

    const handleClear = () => {
        form.setFieldValue("defaultLandingPage", "");
    };

    return (
        <Stack gap="sm">
            <div>
                <Text size="sm" fw={500}>{t("Default Landing Page")}</Text>
                <Text size="xs" c="dimmed">
                    {t("Set a default page to redirect visitors when they visit your domain root. Leave empty to redirect to the home page.")}
                </Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    id="defaultLandingPage"
                    placeholder={t("e.g. /share/98brmvx4vl/p/xkova-docs-copRp6MrXg")}
                    variant="filled"
                    readOnly={!isAdmin}
                    {...form.getInputProps("defaultLandingPage")}
                />

                {isAdmin && (
                    <Stack gap="xs" mt="sm">
                        <Button
                            type="submit"
                            disabled={isLoading || !form.isDirty()}
                            loading={isLoading}
                        >
                            {t("Save")}
                        </Button>

                        {form.values.defaultLandingPage && (
                            <Button
                                variant="subtle"
                                color="gray"
                                onClick={handleClear}
                                disabled={isLoading}
                            >
                                {t("Clear default landing page")}
                            </Button>
                        )}
                    </Stack>
                )}
            </form>

            {form.values.defaultLandingPage && (
                <Text size="xs" c="dimmed">
                    {t("Current landing page: ")}
                    <Text component="span" c="blue" fw={500}>
                        {form.values.defaultLandingPage}
                    </Text>
                </Text>
            )}
        </Stack>
    );
}
