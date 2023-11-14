import { Sex, LikeOrDislike } from "@prisma/client";

export type UserDetail = {
  id: string;
  name: string;
  iconImageUrl?: string;
  sex?: Sex;
  age?: number;
  startedAt?: string;
  description?: string;
  twitter?: string;
  instagram?: string;
  userGameTypes?: {
    id: string;
    gameType: {
      id: string;
      name: string;
    };
    likeOrDislike: LikeOrDislike;
  }[];
  userStrongAreas?: {
    id: string;
    strongArea: {
      id: string;
      name: string;
    };
  }[];
};
