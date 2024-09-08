"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { useClient } from "@xmtp/react-sdk";
import { BrowserProvider } from "ethers";

export default function LoginFemale() {
  const { isConnected, address } = useAccount();
  const { signMessage } = useSignMessage();
  const router = useRouter();

  const { initialize } = useClient();

  const login = useCallback(async () => {
    const authenticate = async (signature: string) => {
      axiosInstance
        .post("/authenticate", {
          signature,
          walletAddress: address,
          gender: "female",
        })
        .then((res) => {
          console.log("res", res);
          localStorage.setItem("user_id", res.data.user.id);
          localStorage.setItem("user_gender", "female");
          localStorage.setItem("user_address", address || "");
          router.push("/matching");
        });
    };

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
    } else {
      alert("Please connect your wallet");
    }
  }, [isConnected, address, signMessage, router, initialize]);

  return (
    <div className="flex justify-center items-center h-full">
      <div className="mt-10">
        <h1 className="text-2xl font-semibold text-rose-500">Login Female</h1>
        <ConnectButton />
        {isConnected && (
          <button className="p-3 border rounded-md border-rose-500" onClick={login}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}
