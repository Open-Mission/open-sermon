import { getTranslations } from "next-intl/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("welcome")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("newSermon")}</CardTitle>
            <CardDescription>{t("newSermonDesc")}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("series")}</CardTitle>
            <CardDescription>{t("seriesDesc")}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("library")}</CardTitle>
            <CardDescription>{t("libraryDesc")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
