"use client";

import Link from "next/link";
import TinderCard from "../components/TinderCard";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function ProfileMalePage() {
  const { address } = useAccount();
  const router = useRouter();
  const { data: profile, isError } = useQuery({
    queryKey: ["profile", address],
    queryFn: () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        router.push("/login-donor");
        return;
      }
      return axiosInstance
        .get("/profile", {
          params: {
            userId,
          },
        })
        .then((res) => res.data);
    },
  });

  if (isError) {
    router.push("/onboarding-donor");
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-cyan-200 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        {profile ? <TinderCard card={profile} /> : <div className="text-center py-8">Loading...</div>}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Profile Complete!</h2>
          <div className="space-y-4">
            <Link
              href="/onboarding-donor"
              className="block w-full bg-blue-500 text-white py-3 px-6 rounded-full text-xl font-semibold hover:bg-blue-600 transition duration-300"
            >
              Edit profile
            </Link>
            <Link
              href="/messages"
              className="block w-full bg-green-500 text-white py-3 px-6 rounded-full text-xl font-semibold hover:bg-green-600 transition duration-300"
            >
              See matches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
