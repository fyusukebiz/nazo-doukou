import { format, isToday, getHours, getMinutes } from 'date-fns';

export const formatDateTimeFlex = ({
  rawDate,
  hideTime = false,
  hideYear = false,
}: {
  rawDate: string;
  hideTime?: boolean;
  hideYear?: boolean;
}) => {
  if (rawDate === '') return '';

  const date = new Date(rawDate);
  if (isToday(date)) {
    if (hideTime) {
      return '今日';
    } else {
      return `今日 ${String(getHours(date)).padStart(2, '0')}:${String(getMinutes(date)).padStart(2, '0')}`;
    }
  } else if (hideTime && hideYear) {
    return format(date, 'MM/dd');
  } else if (!hideTime && hideYear) {
    return format(date, 'MM/dd HH:mm');
  } else if (hideTime && !hideYear) {
    return format(date, 'yyyy/MM/dd');
  } else {
    return format(date, 'yyyy/MM/dd HH:mm');
  }
};
