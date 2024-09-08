"use client";

import Card, { SwipeType } from "@/components/features/matching/Card";
import { axiosInstance } from "@/lib/axios";
import { IProfile } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";

export type ResultType = { [k in SwipeType]: number };

export type HistoryType = IProfile & { swipe: SwipeType };

interface CounterProps {
  testid: string;
  label: string;
  count: number;
}

const Counter: React.FC<CounterProps> = ({ count, label, testid }) => {
  return (
    <div className="flex flex-col items-center space-y-2 bg-white p-3 rounded-lg shadow-md">
      <div className="text-2xl font-semibold" data-testid={testid}>
        {count}
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
};

export default function Page() {
  const [cards, setCards] = useState<IProfile[]>([]);

  const { address } = useAccount();

  const { data: cardsData } = useQuery({
    queryKey: ["cards", address],
    queryFn: () => {
      return axiosInstance
        .get("/profiles", {
          params: {
            userId: localStorage.getItem("user_id"),
          },
        })
        .then((res) => res.data);
    },
  });

  useEffect(() => {
    if (!cardsData) return;
    setCards(cardsData);
  }, [cardsData]);

  const [result, setResult] = useState<ResultType>({
    like: 0,
    dislike: 0,
  });
  // index of last card
  const activeIndex = cards.length - 1;
  const removeCard = (oldCard: IProfile, swipe: SwipeType) => {
    axiosInstance.post("/swipe", {
      userId: localStorage.getItem("user_id"),
      profileId: oldCard.id,
      action: swipe,
    });
    setCards((current) =>
      current.filter((card) => {
        return card.id !== oldCard.id;
      })
    );
    setResult((current) => ({ ...current, [swipe]: current[swipe] + 1 }));
  };

  console.log(cards);

  return (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">
        <div className="relative h-[582px] w-[300px] flex items-center justify-center">
          <AnimatePresence>
            {cards.map((card, index) => (
              <Card key={card.id} active={index === activeIndex} removeCard={removeCard} card={card} />
            ))}
          </AnimatePresence>
          {cards.length === 0 && !cardsData && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <span className="mt-4 text-xl">Loading profiles...</span>
            </div>
          )}
          {cards.length === 0 && cardsData && (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">🏁</span>
              <span className="text-2xl font-semibold">End of Stack</span>
              <p className="mt-2 text-gray-600">No more profiles to show right now.</p>
              <button
                className="mt-6 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                onClick={() => window.location.reload()}
              >
                Refresh Profiles
              </button>
            </div>
          )}
        </div>
        <footer className="grid grid-cols-2 mt-6 gap-4">
          <Counter label="Likes" count={result.like} testid="like-count" />
          <Counter label="Dislikes" count={result.dislike} testid="dislike-count" />
        </footer>
      </div>
    </div>
  );
}
