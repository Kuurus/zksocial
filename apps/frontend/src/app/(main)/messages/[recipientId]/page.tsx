"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConversations, useSendMessage, useStartConversation } from "@xmtp/react-sdk";
import ConversationMessages from "./ConversationMessages";

export default function Page({ params }: { params: { recipientId: string } }) {
  const [messageBody, setMessageBody] = useState("");
  const { startConversation } = useStartConversation();
  const { conversations } = useConversations();

  const _conversation = conversations.find((conversation) => conversation.peerAddress === params.recipientId);
  const [conversation, setConversation] = useState(_conversation);

  const { sendMessage } = useSendMessage();

  const handleSendMessage = async () => {
    console.log("Sending message:", messageBody, conversation);
    if (messageBody.trim() && conversation) {
      console.log("Sending message:", messageBody);
      await sendMessage(conversation, messageBody).catch((error) => {
        console.error("Error sending message:", error);
      });
      setMessageBody("");
    } else if (!conversation && messageBody.trim()) {
      const newConversation = await startConversation(params.recipientId, messageBody);
      console.log("newConversation", newConversation);

      // @ts-expect-error -- idk TODO Fix
      setConversation(newConversation.conversation);
      setMessageBody("");
    }
  };

  useEffect(() => {
    setConversation(_conversation);
  }, [_conversation]);

  const router = useRouter();

  return (
    <div>
      <div className="flex flex-col h-[calc(100vh-77px)] relative">
        <div className="border-b p-4 sticky top-0">
          <div className="flex items-center gap-3">
            <ArrowLeft
              className="w-6 h-6 md:hidden"
              onClick={() => {
                router.push("/messages");
              }}
            />
            <Avatar className="h-10 w-10 border">
              {/* <AvatarImage src={selectedConversation.avatar} alt="Avatar" /> */}
              {conversation ? (
                <AvatarFallback>{conversation.peerAddress.slice(0, 2).toUpperCase()}</AvatarFallback>
              ) : (
                ""
              )}
            </Avatar>
            <div>
              <h3 className="font-medium">{conversation?.peerAddress || "New message"}</h3>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        <div className="overflow-scroll p-4 ">
          <div className="grid gap-4">
            {conversation ? <ConversationMessages conversation={conversation} /> : "No messages yet"}
          </div>
        </div>

        <div className="border-t p-4 sticky bottom-0">
          <div className="relative">
            <Textarea
              placeholder="Type your message..."
              className="pr-16 min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
            />
            <Button type="submit" size="icon" className="absolute w-8 h-8 top-3 right-3" onClick={handleSendMessage}>
              <ArrowUp className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
