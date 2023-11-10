import { UserDetail } from "./user";

export type CommentToRecruit = {
  id: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  user: UserDetail;
};
