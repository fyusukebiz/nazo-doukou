import { format } from "date-fns";
import { NewRecruitFormSchema } from "./NewRecruitFormProvider";
import { toCircled } from "@/utils/toCircled";

type Props = {
  isSelectType: boolean;
  rawData: NewRecruitFormSchema;
  url: string;
};

export const makeTwitterText = ({ isSelectType, rawData, url }: Props) => {
  let text = "";
  text += "#謎解き同行者募集 #謎同行 #脱出ゲーム";
  if (rawData.eventLocation.event.twitterContentTag)
    text += ` #${rawData.eventLocation.event.twitterContentTag}`;
  if (rawData.eventLocation.event.twitterTag)
    text += ` #${rawData.eventLocation.event.twitterTag}`;
  text += "\n";
  text += isSelectType
    ? `${rawData.eventLocation.label}`
    : `${rawData.manualEventName}(${rawData.manualLocation})`;
  text += "\n";
  rawData.possibleDates.forEach((date) => {
    text += `${toCircled(date.priority)}${format(date.date!, "MM/d")} ${
      date.hours
    }`;
    text += "\n";
  });
  text += `募集人数${rawData.numberOfPeople}`;
  text += "\n";
  text += rawData.recruitTags.map((tag) => tag.name).join(" ");
  text += "\n";
  text += "詳細↓";
  text += "\n";
  text += url;
  text += "\n";

  return text;
};
