import { UserDetail } from "./user";
import { CommentToRecruit } from "./commentToRecruit";

export type RecruitSimple = {
  id: string;
  manualEventName?: string;
  manualLocation?: string;
  eventLocation?: {
    id: string;
    building?: string;
    event: {
      id: string;
      name: string;
      coverImageFileUrl?: string;
    };
    location: {
      id: string;
      name: string;
    };
  };
  numberOfPeople?: number;
  possibleDates: {
    id: string;
    date: string;
    priority?: number;
  }[];
  createdAt: string;
};

export type RecruitDetail = {
  id: string;
  user?: UserDetail;
  manualEventName?: string;
  manualLocation?: string;
  eventLocation?: {
    id: string;
    building?: string;
    event: {
      id: string;
      name: string;
      coverImageFileUrl?: string;
      sourceUrl?: string; // 不要？
      twitterTag?: string;
      twitterContentTag?: string;
    };
    location: {
      id: string;
      name: string;
    };
  };
  numberOfPeople?: number;
  description?: string;
  createdAt: string;
  possibleDates: {
    id: string;
    date: string;
    priority?: number;
  }[];
  recruitTags: { id: string; name: string }[];
  commentsToRecruit: CommentToRecruit[];
};
