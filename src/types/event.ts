export type Event = {
  id: string;
  name: string;
  detailedSchedule?: string;
  twitterTag?: string;
  description?: string;
  sourceUrl?: string;
  coverImageFileUrl?: string;
  numberOfPeopleInTeam?: string;
  timeRequired?: string;
  organization?: {
    id: string;
    name: string;
  };
  prefectures: {
    id: string;
    name: string;
    eventLocations: {
      id: string;
      name: string;
      description?: string;
      building?: string;
      color?: string;
      bgColor?: string;
      startedAt?: string;
      endedAt?: string;
      detailedSchedule?: string;
    }[];
  }[];
  gameTypes: {
    id: string;
    name: string;
  }[];
};
