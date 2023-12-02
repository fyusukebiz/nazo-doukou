import { format } from "date-fns";
import { NewRecruitFormSchema } from "./NewRecruitFormProvider";
import { toCircled } from "@/utils/toCircled";

type Props = {
  isSelectType: boolean;
  rawData: NewRecruitFormSchema;
  url: string;
};

export const makeTwitterTextForRecruit = ({
  isSelectType,
  rawData,
  url,
}: Props) => {
  let text = "";
  text += "#謎解き同行者募集 #謎同行 #リアル脱出ゲーム";
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
    }${format(date.date!, "M/d")} ${date.hours}`;
    text += "\n";
  });
  text += `${String.fromCharCode(
    rawData.numberOfPeople.toString().charCodeAt(0) + 0xfee0
  )}人募集`;
  text += "\n";

  // word count
  const maxCount = 140 - 4.5 - 1 - 11.5;

  for (let i = 0; i < rawData.description.length; i++) {
    const char = rawData.description[i];
    const newText = text + char;
    const formattedText = newText.replace(/\n/g, " ");
    const wordCound = countWords(formattedText);
    if (wordCound > maxCount) {
      text += "..";
      break;
    } else {
      text = newText;
    }
  }
  // wordCount + 4.5
  text += "\n";
  text += "\n";
  text += "詳細↓";
  text += "\n";

  // URLは11.5文字固定
  // wordCount + 11.5
  text += url;

  return text;
};

const countWords = (inputString: string): number => {
  let count = 0;

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    count += countCharacter(char);
  }

  return count;
};

const countCharacter = (char: string): number => {
  if (/[ -~]/.test(char)) {
    // 半角英数字記号の場合は0.5文字としてカウント
    return 0.5;
  } else {
    // それ以外（絵文字も含む）は1文字としてカウント
    return 1;
  }
};
