import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="MedCertify | Secure Medical Certificate Login"
        description="Sign in to MedCertify, the secure blockchain-based medical certificate platform for healthcare professionals and patients."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
