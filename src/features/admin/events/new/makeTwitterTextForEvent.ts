import { format } from "date-fns";
import { NewEventFormSchema } from "./NewEventFormProvider";

type Props = {
  rawData: NewEventFormSchema;
  url: string;
};

// eventLocationsの１つ目のものを対象にする
export const makeTwitterTextForEvent = ({ rawData, url }: Props) => {
  const eventLocation = rawData.eventLocations[0];

  let text = "";
  text += "#謎解き同行者募集 #謎同行 #脱出ゲーム";
  if (rawData.twitterContentTag) text += ` #${rawData.twitterContentTag}`;
  if (rawData.twitterTag) text += ` #${rawData.twitterTag}`;
  text += "\n";
  text += "\n";
  text += rawData.name;
  text += "\n";
  text += eventLocation.building
    ? `${eventLocation.building} @ ${eventLocation.location.label}`
    : `${eventLocation.location.label}`;
  text += "\n";
  text += rawData.gameTypes.map((gt) => gt.name).join(" ");
  text += "\n";
  text +=
    eventLocation.dateType === "RANGE"
      ? !!eventLocation.startedAt || !!eventLocation.endedAt
        ? `${
            eventLocation.startedAt
              ? format(new Date(eventLocation.startedAt), "M/d")
              : ""
          } ~ ${
            eventLocation.endedAt
              ? format(new Date(eventLocation.endedAt), "M/d")
              : ""
          }`
        : ""
      : eventLocation.eventLocationDates
          .filter((eld): eld is { date: Date } => !!eld.date)
          .map((eld) => format(eld.date, "M/d"))
          .join(", ");
  text += "\n";
  text += rawData.sourceUrl;

  text += "\n";
  text += "\n";
  text += "詳細↓";
  text += "\n";
  text += url;

  return text;
};
