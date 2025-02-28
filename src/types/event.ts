import { EventLocationDateType } from "@prisma/client";

export type EventSimple = {
  id: string;
  name: string;
  coverImageFileUrl?: string;
};

export type EventDetail = {
  id: string;
  name: string;
  twitterTag?: string;
  twitterContentTag?: string;
  description?: string;
  sourceUrl?: string;
  numberOfPeopleInTeam?: string;
  timeRequired?: string;
  coverImageFileUrl?: string;
  organization?: {
    id: string;
    name: string;
  };
  eventLocations: {
    id: string;
    location: {
      id: string;
      name: string;
    };
    building?: string;
    description?: string;
    dateType: EventLocationDateType;
    startedAt?: string;
    endedAt?: string;
    eventLocationDates: { id: string; date: string }[];
  }[];
  eventGameTypes: {
    id: string;
    gameType: {
      id: string;
      name: string;
    };
  }[];
};
