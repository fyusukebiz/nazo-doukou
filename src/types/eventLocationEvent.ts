export type EventLocationEventSimple = {
  id: string;
  startedAt?: string;
  endedAt?: string;
  event: {
    id: string;
    name: string;
    coverImageFileUrl?: string;
  };
  eventLocation: {
    id: string;
    name: string;
    prefecture: {
      id: string;
      name: string;
    };
  };
};

export type EventLocationEventDetail = {
  id: string;
  startedAt?: string;
  endedAt?: string;
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
  eventLocation: {
    id: string;
    name: string;
    prefecture: {
      id: string;
      name: string;
    };
  };
};

export type EventLocationEventOption = {
  id: string;
  name: string;
  location: string;
};
