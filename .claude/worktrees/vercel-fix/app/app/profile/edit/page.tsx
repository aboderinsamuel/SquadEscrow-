import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { EditForm } from "./EditForm";

export default async function ProfileEditPage() {
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  return (
    <>
      <AppHeader title="Edit profile" back />
      <EditForm
        initial={{
          name: me.name || "",
          area: me.area || "",
          bio: me.bio || "",
          skills: me.skills || [],
          hourly_rate: me.hourly_rate ?? null,
          business_name: me.business_name || "",
          is_business: !!me.business_name,
        }}
      />
    </>
  );
}
