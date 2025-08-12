import { Container, Space } from "@mantine/core";
import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/features/user/atoms/current-user-atom.ts";
import HomeTabs from "@/features/home/components/home-tabs";
import SpaceGrid from "@/features/space/components/space-grid.tsx";
import { getAppName } from "@/lib/config.ts";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const currentUser = useAtomValue(currentUserAtom);

  // Remove the redirect logic from here since it's now handled in RootRedirect component

  return (
    <>
      <Helmet>
        <title>
          {t("Home")} - {getAppName()}
        </title>
      </Helmet>
      <Container size={"800"} pt="xl">
        <SpaceGrid />

        <Space h="xl" />

        <HomeTabs />
      </Container>
    </>
  );
}
