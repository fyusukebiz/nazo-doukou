import { Sex, LikeOrDislike } from "@prisma/client";

export type User = {
  name: string;
  iconImageUrl?: string;
  sex?: Sex;
  age?: number;
  startedAt?: string;
  description?: string;
  twitter?: string;
  instagram?: string;
  userGameTypes: {
    gameTypeId: string;
    likeOrDislike: LikeOrDislike;
  }[];
};
