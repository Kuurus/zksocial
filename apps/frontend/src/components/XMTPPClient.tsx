"use client";
import { useClient } from "@xmtp/react-sdk";
import { BrowserProvider } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useCreateXMTPClient = () => {
  const { client, error, isLoading, initialize } = useClient();

  const { isConnected } = useAccount();
  const [signer, setSigner] = useState<any | null>(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum?.request({ method: "eth_requestAccounts" });
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setSigner(signer);
        } catch (error) {
          console.error("Failed to connect to MetaMask", error);
        }
      }
    };

    connectWallet();
  }, []);

  const handleConnect = useCallback(async () => {
    if (client) {
      return;
    }
    const options = {
      persistConversations: false,
      env: "dev",
    } as const;
    await initialize({ options, signer });
  }, [initialize, signer, client]);

  useEffect(() => {
    if (isConnected) {
      handleConnect();
    }
  }, [isConnected, handleConnect]);

  return true;
};
