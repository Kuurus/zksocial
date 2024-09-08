import React, { useState, useEffect } from "react";
import { CachedConversation, ContentTypeMetadata, useMessages, useStreamMessages } from "@xmtp/react-sdk";
import ConversationMessage from "@/components/features/messages/ConversationMessage";

interface ConversationMessagesProps {
  conversation: CachedConversation<ContentTypeMetadata>;
}

const ConversationMessages: React.FC<ConversationMessagesProps> = ({ conversation: _conversation }) => {
  const [conversation, setConversation] = useState(_conversation);

  useEffect(() => {
    if (_conversation.topic !== conversation.topic) {
      setConversation(_conversation);
    }
  }, [_conversation, conversation.topic]);

  const { messages } = useMessages(conversation);
  const [myAddress, setMyAddress] = useState<string | null>(null);

  useEffect(() => {
    const getMyAddress = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          if (accounts.length > 0) {
            setMyAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Failed to get Ethereum address", error);
        }
      } else {
        console.error("Ethereum provider not found");
      }
    };

    getMyAddress();
  }, []);

  return (
    <div className="overflow-scroll p-4">
      <div className="grid gap-4">
        {messages.map((message, index) => (
          <ConversationMessage
            key={index}
            message={message.content}
            time={message.sentAt.toLocaleTimeString()}
            isMe={message.senderAddress.toLocaleLowerCase() === myAddress?.toLocaleLowerCase()}
            avatar="/placeholder-user.jpg"
            name={message.senderAddress}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationMessages;
