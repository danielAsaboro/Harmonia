export const dateUtils = {
    isValidScheduleDate: (date: Date): boolean => {
      const now = new Date();
      return date > now;
    },
  
    formatScheduleDate: (date: Date): string => {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };