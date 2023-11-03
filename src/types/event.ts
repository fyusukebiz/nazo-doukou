export type EventSimple = {
  id: string;
  name: string;
  coverImageFileUrl?: string;
};

export type EventDetail = {
  id: string;
  name: string;
  twitterTag?: string;
  description?: string;
  sourceUrl?: string;
  numberOfPeopleInTeam?: string;
  timeRequired?: string;
  coverImageFileUrl?: string;
  organization?: {
    id: string;
    name: string;
  };
  eventLocationEvents: {
    id: string;
    eventLocation: {
      id: string;
      name: string;
    };
    building?: string;
    description?: string;
    startedAt?: string;
    endedAt?: string;
    detailedSchedule?: string;
  }[];
  gameTypes: {
    id: string;
    name: string;
  }[];
};
