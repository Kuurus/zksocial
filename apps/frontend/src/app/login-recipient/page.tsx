"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { useClient } from "@xmtp/react-sdk";
import { BrowserProvider } from "ethers";

export default function LoginRecipient() {
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
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-rose-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-rose-600 mb-6 text-center">Login as Recipient 🫄</h1>
        <div className="mb-6">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              return (
                <div
                  {...(!mounted && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!mounted || !account || !chain) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="w-full bg-rose-500 text-white py-2 px-4 rounded-md hover:bg-rose-600 transition duration-300"
                        >
                          Connect Wallet
                        </button>
                      );
                    }
                    return (
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={openChainModal}
                          className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-300"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: "hidden",
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          <span>{chain.name}</span>
                        </button>
                        <button
                          onClick={openAccountModal}
                          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-300"
                        >
                          {account.displayName}
                          {account.displayBalance ? ` (${account.displayBalance})` : ""}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
        {isConnected && (
          <button
            className="w-full bg-rose-500 text-white py-2 px-4 rounded-md hover:bg-rose-600 transition duration-300"
            onClick={login}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
