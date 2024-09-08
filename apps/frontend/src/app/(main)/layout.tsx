"use client";
import { useCreateXMTPClient } from "@/components/XMTPPClient";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useClient } from "@xmtp/react-sdk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();

  const { client, disconnect } = useClient();

  const router = useRouter();
  useEffect(() => {
    if (address && address !== localStorage.getItem("user_address")) {
      return router.push("/login");
    }
    if (!localStorage.getItem("user_id")) {
      return router.push("/login");
    }
  }, [address, router]);

  function logout() {
    disconnect().then(() => {
      client?.close();
    });
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_gender");
    localStorage.removeItem("user_address");
    router.push("/login");
  }

  const genre = localStorage.getItem("user_gender");

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="flex justify-start bg-muted/40  border-b p-4 items-center gap-6">
        <p className="text-2xl font-semibold">Spermify 👼</p>
        <Link href="/messages">Messages</Link>
        {genre === "female" && <Link href="/matching">Matching</Link>}
        <p className={cn(genre === "female" ? "text-rose-500" : "text-blue-500")}>Logged as : {genre}</p>
        <ConnectButton />
        <button onClick={logout}>Logout</button>
      </div>
      <div className="h-[calc(100vh-65px)]">{children}</div>
    </div>
  );
}
