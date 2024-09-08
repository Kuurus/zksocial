"use client";

import ConversationItem from "@/components/features/messages/ConversationItem";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useConversations } from "@xmtp/react-sdk";
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { address } = useAccount();
  const { conversations } = useConversations();

  const selectedConversation = conversations.find(
    (conversation) => conversation.peerAddress === pathname.split("/")[2]
  );

  const { data: matches } = useQuery({
    queryKey: ["matches", address],
    queryFn: () =>
      axiosInstance
        .get("/matches", { params: { userId: localStorage.getItem("user_id_" + address) } })
        .then((res) => res.data?.matches as [{ walletAddress: string; image: string }]),
  });

  console.log("matches", matches);

  return (
    <div className="grid h-full w-full bg-background md:grid-cols-[300px_1fr]">
      <div
        className={cn(
          "border-b bg-muted/40 p-4 md:border-r md:p-4 max-h-full overflow-scroll",
          selectedConversation && "hidden md:block"
        )}
      >
        <div className="mb-4 flex items-center justify-between ">
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        <div className="space-y-2 overflow-auto">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.topic}
              name={conversation.peerAddress}
              message={""}
              time={conversation.lastSyncedAt?.toDateString() || ""}
              avatar="/placeholder-user.jpg"
              onClick={() => {
                router.push(`/messages/${conversation.peerAddress}`);
              }}
              isActive={selectedConversation?.peerAddress === conversation.peerAddress}
            />
          ))}
          <p>New matches ({matches?.length}) </p>
          {matches
            ?.filter((match) => !conversations.find((conversation) => conversation.peerAddress === match.walletAddress))
            .map((match) => (
              <ConversationItem
                key={match.walletAddress}
                name={match.walletAddress}
                message={""}
                time={""}
                avatar={match.image}
                onClick={() => {
                  router.push(`/messages/${match.walletAddress}`);
                }}
                isActive={selectedConversation?.peerAddress === match.walletAddress}
              />
            ))}
        </div>
      </div>

      {children}
    </div>
  );
}
