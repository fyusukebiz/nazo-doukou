export type Event = {
  id: string;
  name: string;
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
      dates: {
        id: string;
        date: string;
      }[];
    }[];
  }[];
};
