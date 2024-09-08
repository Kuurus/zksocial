"use client";

import Card, { SwipeType } from "@/components/features/matching/Card";
import { axiosInstance } from "@/lib/axios";
import { IProfile } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export type ResultType = { [k in SwipeType]: number };

export type HistoryType = IProfile & { swipe: SwipeType };

interface CounterProps {
  testid: string;
  label: string;
  count: number;
}

const Counter: React.FC<CounterProps> = ({ count, label, testid }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className="w-14 h-8 text-xl font-medium rounded-full bg-white inline-flex justify-center items-center"
        data-testid={testid}
      >
        {count}
      </div>
      <span className="text-xs">{label}</span>
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
      <div>
        <div className="relative h-[582px] w-[300px]">
          <AnimatePresence>
            {cards.map((card, index) => (
              <Card key={card.id} active={index === activeIndex} removeCard={removeCard} card={card} />
            ))}
          </AnimatePresence>
          {cards.length === 0 ? <span className=" text-xl">End of Stack</span> : null}
        </div>
        <footer className="grid grid-cols-3 mt-6">
          <Counter label="Likes" count={result.like} testid="like-count" />
          <Counter label="Dislikes" count={result.dislike} testid="dislike-count" />
        </footer>
      </div>
    </div>
  );
}
