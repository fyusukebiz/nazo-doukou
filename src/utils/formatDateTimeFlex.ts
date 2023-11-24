import { format, isToday, getHours, getMinutes, getYear } from "date-fns";

export const formatDateTimeFlex = ({
  rawDate,
  hideTime = false,
  hideFromThisYear = false, // 今年以降
}: {
  rawDate: string;
  hideTime?: boolean;
  hideFromThisYear?: boolean;
}) => {
  if (rawDate === "") return "";

  const date = new Date(rawDate);
  const now = new Date();
  if (isToday(date)) {
    if (hideTime) {
      return "今日";
    } else {
      return `今日 ${String(getHours(date)).padStart(2, "0")}:${String(
        getMinutes(date)
      ).padStart(2, "0")}`;
    }
  } else if (hideTime && hideFromThisYear) {
    return format(date, `${getYear(date) < getYear(now) ? "yyyy/" : ""}M/d`);
  } else if (!hideTime && hideFromThisYear) {
    return format(
      date,
      `${getYear(date) < getYear(now) ? "yyyy/" : ""}M/d HH:mm`
    );
  } else if (hideTime && !hideFromThisYear) {
    return format(date, "yyyy/M/d");
  } else {
    return format(date, "yyyy/M/d HH:mm");
  }
};
