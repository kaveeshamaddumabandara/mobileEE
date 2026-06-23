export type BookedSlot = {
  startTime: string;
  endTime: string;
  duration?: number;
  status?: string;
};

export const BOOKING_START_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export const getMinimumBookingDate = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

export const parseTimeToMinutes = (timeStr: string): number | null => {
  if (!timeStr) {
    return null;
  }

  const trimmed = timeStr.trim();
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
};

const getSlotEndMinutes = (slot: BookedSlot): number | null => {
  const startMinutes = parseTimeToMinutes(slot.startTime);
  if (startMinutes === null) {
    return null;
  }

  let endMinutes = parseTimeToMinutes(slot.endTime);
  if (endMinutes === null || endMinutes <= startMinutes) {
    const duration = Number(slot.duration);
    if (duration > 0) {
      endMinutes = startMinutes + duration * 60;
    }
  }

  return endMinutes;
};

const doTimesOverlap = (start1: number, end1: number, start2: number, end2: number) =>
  start1 < end2 && start2 < end1;

export const isSlotBlocked = (
  startMinutes: number,
  durationHours: number,
  bookedSlots: BookedSlot[],
): boolean => {
  const endMinutes = startMinutes + durationHours * 60;

  return bookedSlots.some(slot => {
    const slotStart = parseTimeToMinutes(slot.startTime);
    const slotEnd = getSlotEndMinutes(slot);

    if (slotStart === null || slotEnd === null) {
      return false;
    }

    return doTimesOverlap(startMinutes, endMinutes, slotStart, slotEnd);
  });
};

export const isBookingTimeBlocked = (
  bookingTime: Date,
  durationHours: number,
  bookedSlots: BookedSlot[],
): boolean => {
  const startMinutes = bookingTime.getHours() * 60 + bookingTime.getMinutes();
  return isSlotBlocked(startMinutes, durationHours, bookedSlots);
};

export const isBookingTimeUnavailable = (
  bookingTime: Date,
  durationHours: number,
  bookedSlots: BookedSlot[],
  workStartTime?: string,
  workEndTime?: string,
): boolean => {
  const startMinutes = bookingTime.getHours() * 60 + bookingTime.getMinutes();
  return isSlotUnavailable(
    startMinutes,
    durationHours,
    bookedSlots,
    workStartTime,
    workEndTime,
  );
};

export const formatHourLabel = (hour: number): string => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatBookedSlotLabel = (slot: BookedSlot): string => {
  const start = parseTimeToMinutes(slot.startTime);
  const end = getSlotEndMinutes(slot);

  if (start === null || end === null) {
    return `${slot.startTime} - ${slot.endTime}`;
  }

  const startDate = new Date();
  startDate.setHours(Math.floor(start / 60), start % 60, 0, 0);

  const endDate = new Date();
  endDate.setHours(Math.floor(end / 60), end % 60, 0, 0);

  const startLabel = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const endLabel = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${startLabel} - ${endLabel}`;
};

export const formatWorkTimeLabel = (timeStr?: string): string => {
  const minutes = parseTimeToMinutes(timeStr || '');
  if (minutes === null) {
    return timeStr || '';
  }

  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const getWorkingHoursLabel = (
  workStartTime?: string,
  workEndTime?: string,
): string | null => {
  if (!workStartTime || !workEndTime) {
    return null;
  }

  return `${formatWorkTimeLabel(workStartTime)} - ${formatWorkTimeLabel(workEndTime)}`;
};

export const isOutsideWorkingHours = (
  startMinutes: number,
  durationHours: number,
  workStartTime?: string,
  workEndTime?: string,
): boolean => {
  const workStart = parseTimeToMinutes(workStartTime || '');
  const workEnd = parseTimeToMinutes(workEndTime || '');

  if (workStart === null || workEnd === null || workEnd <= workStart) {
    return false;
  }

  const endMinutes = startMinutes + durationHours * 60;
  return startMinutes < workStart || endMinutes > workEnd;
};

export const getAvailableBookingHours = (
  durationHours: number,
  workStartTime?: string,
  workEndTime?: string,
): number[] => {
  const workStart = parseTimeToMinutes(workStartTime || '');
  const workEnd = parseTimeToMinutes(workEndTime || '');

  return BOOKING_START_HOURS.filter(hour => {
    const startMinutes = hour * 60;
    const endMinutes = startMinutes + durationHours * 60;

    if (workStart !== null && workEnd !== null && workEnd > workStart) {
      if (startMinutes < workStart || endMinutes > workEnd) {
        return false;
      }
    }

    return true;
  });
};

export const isSlotUnavailable = (
  startMinutes: number,
  durationHours: number,
  bookedSlots: BookedSlot[],
  workStartTime?: string,
  workEndTime?: string,
): boolean =>
  isOutsideWorkingHours(startMinutes, durationHours, workStartTime, workEndTime) ||
  isSlotBlocked(startMinutes, durationHours, bookedSlots);
