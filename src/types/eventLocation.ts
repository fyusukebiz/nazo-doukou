import { EventLocationDateType } from "@prisma/client";

export type EventLocationSimple = {
  id: string;
  dateType: EventLocationDateType;
  startedAt?: string;
  endedAt?: string;
  eventLocationDates: { id: string; date: string }[];
  event: {
    id: string;
    name: string;
    coverImageFileUrl?: string;
    timeRequired?: string;
  };
  location: {
    id: string;
    name: string;
    prefecture: {
      id: string;
      name: string;
    };
  };
};

export type EventLocationDetail = {
  id: string;
  dateType: EventLocationDateType;
  startedAt?: string;
  endedAt?: string;
  eventLocationDates: { id: string; date: string }[];
  detailedSchedule?: string;
  building?: string;
  description?: string;
  event: {
    id: string;
    name: string;
    coverImageFileUrl?: string;
    numberOfPeopleInTeam?: string;
    timeRequired?: string;
    twitterTag?: string;
    twitterContentTag?: string;
    sourceUrl?: string;
    description?: string;
    organization?: {
      id: string;
      name: string;
    };
    gameTypes: {
      id: string;
      name: string;
    }[];
  };
  location: {
    id: string;
    name: string;
    prefecture: {
      id: string;
      name: string;
    };
  };
};

export type EventLocationOption = {
  id: string;
  name: string;
  location: string;
  building?: string;
  event: {
    id: string;
    twitterTag?: string;
    twitterContentTag?: string;
  };
};
