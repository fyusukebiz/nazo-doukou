import { Sex, LikeOrDislike } from "@prisma/client";

export type UserDetail = {
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

export type UserSimple = {
  id?: string;
  name: string;
  iconImageUrl?: string;
  twitter?: string;
  instagram?: string;
};
