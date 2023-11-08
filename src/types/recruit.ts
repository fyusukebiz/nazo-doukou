import { UserSimple } from "./user";

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
  user: UserSimple;
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
  comments: {
    id: string;
    message: string;
    createdAt: string;
    updatedAt: string;
    user: UserSimple;
  }[];
};
