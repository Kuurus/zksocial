"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { useClient } from "@xmtp/react-sdk";
import { BrowserProvider } from "ethers";

export default function LoginMale() {
  const { isConnected, address } = useAccount();
  const { signMessage } = useSignMessage();
  const router = useRouter();

  const { client, error, isLoading, initialize } = useClient();

  useEffect(() => {
    const authenticate = async (signature: string) => {
      axiosInstance
        .post("/authenticate", {
          signature,
          walletAddress: address,
          gender: "male",
        })
        .then((res) => {
          console.log("res", res);
          localStorage.setItem("user_id", res.data.user.id);
          localStorage.setItem("user_gender", "male");
          localStorage.setItem("user_address", address || "");
          if (res.data.isOnboardingDone) {
            router.push("/profile-male");
          } else {
            router.push("/onboarding-male");
          }
        });
    };

    const sign = async () => {
      if (isConnected && address) {
        const storedSignature = localStorage.getItem("signature_" + address);
        console.log("storedSignature", storedSignature, typeof storedSignature);

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const options = {
          persistConversations: false,
          env: "dev",
        } as const;
        await initialize({ options, signer });

        if (storedSignature) {
          console.log("Using stored signature:", storedSignature);
          authenticate(storedSignature);
        } else {
          await signMessage(
            { message: "Sign this message to connect with Kinto." },
            {
              onSuccess: (data) => {
                console.log("New signature:", data);
                localStorage.setItem("signature_" + address, data);
                authenticate(data);
              },
              onError: (error) => {
                console.error("Error signing message:", error);
              },
            }
          );
        }
      }
    };
    setTimeout(sign, 600);
  }, [address, isConnected, router, signMessage, initialize]);

  return (
    <div className="flex justify-center items-center h-full">
      <div className="mt-10">
        <h1 className="text-2xl font-semibold text-blue-500">Login Male</h1>
        <ConnectButton />
      </div>
    </div>
  );
}
