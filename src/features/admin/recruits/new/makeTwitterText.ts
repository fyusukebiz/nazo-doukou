import { format } from "date-fns";
import { NewAdminRecruitFormSchema } from "./NewAdminRecruitFormProvider";
import { toCircled } from "@/utils/toCircled";

type Props = {
  isSelectType: boolean;
  rawData: NewAdminRecruitFormSchema;
  url: string;
};

export const makeTwitterText = ({ isSelectType, rawData, url }: Props) => {
  let text = "";
  text += "#謎解き同行者募集 #謎同行 #脱出ゲーム";
  if (rawData.eventLocation.event?.twitterContentTag)
    text += ` #${rawData.eventLocation.event.twitterContentTag}`;
  if (rawData.eventLocation.event?.twitterTag)
    text += ` #${rawData.eventLocation.event.twitterTag}`;
  text += "\n";
  text += "\n";
  text += isSelectType
    ? `${rawData.eventLocation.label}`
    : `${rawData.manualEventName}(${rawData.manualLocation})`;
  text += "\n";
  rawData.possibleDates.forEach((date) => {
    text += `${
      rawData.possibleDates.length > 1 ? toCircled(date.priority) : ""
    }${format(date.date!, "MM/d")} ${date.hours}`;
    text += "\n";
  });
  text += `${rawData.numberOfPeople.toString()}人募集`;
  text += "\n";
  if (rawData.recruitTags.length > 0) {
    text += rawData.recruitTags.map((tag) => tag.name).join(" ");
    text += "\n";
  }
  text += "詳細↓";
  text += "\n";
  text += url;

  return text;
};
