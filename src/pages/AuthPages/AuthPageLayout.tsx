import React from "react";
import PageMeta from '../../components/common/PageMeta';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <PageMeta
        title="MedCertify"
        description="MedCertify is a secure, blockchain-based medical certificate platform for healthcare professionals and patients."
      />
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Branding: On mobile, on top; on desktop, on right */}
      <div className="flex items-center justify-center bg-white px-8 py-12 w-full lg:w-1/2 order-1 lg:order-2">
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <img src={`${import.meta.env.BASE_URL}images/logo/logo-1.png`} alt="MedCertify Logo" className="w-28 h-28 object-contain mb-6" />
          <h2 className="text-3xl font-bold text-[#087BBA] mb-3 text-center">MedCertify</h2>
          <p className="text-grey text-lg text-center max-w-xs opacity-90">
            Secure, blockchain-based medical certificate platform for healthcare professionals and patients.
          </p>
        </div>
      </div>
      {/* Sign In Form: On mobile, below branding; on desktop, on left */}
      <div className="flex flex-1 items-center justify-center bg-[#087BBA] px-4 py-12 w-full lg:w-1/2 order-2 lg:order-1">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
    </>
  );
}
