import { format } from "date-fns";
import { NewRecruitFormSchema } from "./NewRecruitFormProvider";

type Props = {
  isSelectType: boolean;
  rawData: NewRecruitFormSchema;
  url: string;
};

export const makeTwitterText = ({ isSelectType, rawData, url }: Props) => {
  let text = "";
  text += "イベント: ";
  text += isSelectType
    ? rawData.eventLocation.label
    : `${rawData.manualEventName}(${rawData.manualLocation})`;
  text += "\n";
  text += "募集人数: ";
  text += `${rawData.numberOfPeople}人`;
  text += "\n";
  text += "希望日: ";
  text += rawData.possibleDates
    .map((date) => format(date.date!, "MM/d"))
    .join(", ");
  text += "\n";
  text += "詳細: ";
  text += "\n";
  text += url;
  text += "\n";

  return text;
};
