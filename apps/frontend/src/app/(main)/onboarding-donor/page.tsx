"use client";

import { useAccount } from "wagmi";
import ProfileOnboarding from "../components/ProfileOnboarding";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function OnboardingMalePage() {
  const { address } = useAccount();
  const router = useRouter();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md">
        <ProfileOnboarding
          onComplete={(profile) => {
            console.log("profile", profile);
            const userId = localStorage.getItem("user_id");
            if (!userId) {
              return router.push("/login-donor");
            }
            axiosInstance
              .post("/profile", {
                ...profile,
                userId,
              })
              .then((res) => {
                router.push("/profile-donor");
              });
          }}
        />
      </div>
    </div>
  );
}
