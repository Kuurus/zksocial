import TinderCard from "@/app/(main)/components/TinderCard";
import { IProfile } from "@/types";
import { PanInfo, motion } from "framer-motion";
import { Heart, RotateCwIcon, X } from "lucide-react";
import { useState } from "react";

export type SwipeType = "like" | "dislike";

export interface CardProps {
  card: IProfile;
  active: boolean;
  removeCard: (oldCard: IProfile, swipe: SwipeType) => void;
}
const Card: React.FC<CardProps> = ({ card, removeCard, active }) => {
  const [leaveX, setLeaveX] = useState(0);
  const [leaveY, setLeaveY] = useState(0);

  const onLike = () => {
    setLeaveX(1000);
    removeCard(card, "like");
  };

  const onNope = () => {
    setLeaveX(-1000);
    removeCard(card, "dislike");
  };

  const onDragEnd = (_e: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      return onLike();
    }
    if (info.offset.x < -100) {
      return onNope();
    }
  };
  const classNames = `h-[430px] w-[300px] bg-white flex flex-col justify-center items-center cursor-grab rounded-lg shadow-lg`;

  return (
    <div className="absolute">
      <div>
        {active ? (
          <motion.div
            drag={true}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={onDragEnd}
            initial={{
              scale: 1,
            }}
            animate={{
              scale: 1.05,
              rotate: `${card.age % 2 === 0 ? 6 : -6}deg`,
            }}
            exit={{
              x: leaveX,
              y: leaveY,
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.4 },
            }}
            className={classNames}
            data-testid="active-card"
          >
            <TinderCard card={card} />
          </motion.div>
        ) : (
          <div className={`${classNames} ${card.age % 2 === 0 ? "rotate-3" : "-rotate-3"}`}>
            <TinderCard card={card} />
          </div>
        )}
      </div>
      {active && !leaveX && !leaveY && (
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            onClick={onNope}
            className="bg-red-500 p-3 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="text-white w-8 h-8" />
          </button>
          <button
            onClick={onLike}
            className="bg-green-500 p-3 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <Heart className="text-white w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * a11y friendly component for emojis
 * @reference https://devyarns.com/accessible-emojis
 */
const Emoji: React.FC<{ emoji: string; label: string }> = ({ emoji, label }) => {
  return (
    <span role="img" aria-label={label} className="text-[140px]">
      {emoji}
    </span>
  );
};

const Title: React.FC<{ title: string; color: string }> = ({ title, color }) => {
  return (
    <span style={{ color }} className="text-5xl font-bold">
      {title}
    </span>
  );
};

export default Card;
