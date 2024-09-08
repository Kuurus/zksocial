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
  const { data: profile } = useQuery({
    queryKey: ["profile", address],
    queryFn: () => {
      const userId = localStorage.getItem("user_id_" + address);
      if (!userId) {
        router.push("/login-male");
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
  return (
    <div className="w-full max-w-md">
      {profile ? <TinderCard card={profile} /> : <div>Loading...</div>}
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Profile Complete!</h2>
        <Link
          href="/onboarding-male"
          className="bg-white text-pink-500 py-3 px-6 rounded-full text-xl font-semibold hover:bg-pink-100 transition duration-300"
        >
          Edit profile
        </Link>
        <Link
          href="/conversation"
          className="bg-white text-pink-500 py-3 px-6 rounded-full text-xl font-semibold hover:bg-pink-100 transition duration-300"
        >
          See matches
        </Link>
      </div>
    </div>
  );
}
