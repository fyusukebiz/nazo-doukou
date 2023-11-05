export type RecruitSimple = {
  id: string;
  manualEventName?: string;
  manualEventLocation?: string;
  eventLocationEvent?: {
    id: string;
    building?: string;
    event: {
      id: string;
      name: string;
      coverImageFileUrl?: string;
    };
    eventLocation: {
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
  user: {
    id?: string;
    name: string;
    iconImageUrl?: string;
    twitter?: string;
    instagram?: string;
  };
  manualEventName?: string;
  manualEventLocation?: string;
  eventLocationEvent?: {
    id: string;
    building?: string;
    event: {
      id: string;
      name: string;
      coverImageFileUrl?: string;
      sourceUrl?: string; // 不要？
    };
    eventLocation: {
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
    user: {
      id: string;
      name: string;
      iconImageUrl?: string;
    };
  }[];
};
