import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="Profile | MedCertify"
        description="Your MedCertify profile."
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="flex justify-center items-center min-h-[60vh] w-full">
          <UserMetaCard />
      </div>
    </>
  );
}
