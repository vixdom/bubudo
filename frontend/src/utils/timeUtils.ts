// Helper function to parse estimated time strings into minutes
export function parseEstimatedTime(timeString?: string): number {
  if (!timeString) return 0;

  // Remove approximate markers like '~'
  const cleanedTime = timeString.replace('~', '').trim();

  let totalMinutes = 0;

  // Match patterns like "X minutes", "Y hours", "X-Y hours/minutes"
  const hourMatch = cleanedTime.match(/(\d+(\.\d+)?)-?(\d+(\.\d+)?)?\s+hours?/i);
  const minuteMatch = cleanedTime.match(/(\d+)-?(\d+)?\s+minutes?/i);

  if (hourMatch) {
    const lowerBound = parseFloat(hourMatch[1]);
    const upperBound = hourMatch[3] ? parseFloat(hourMatch[3]) : lowerBound;
    totalMinutes = ((lowerBound + upperBound) / 2) * 60; // Average if range
  } else if (minuteMatch) {
    const lowerBound = parseInt(minuteMatch[1], 10);
    const upperBound = minuteMatch[2] ? parseInt(minuteMatch[2], 10) : lowerBound;
    totalMinutes = (lowerBound + upperBound) / 2; // Average if range
  }

  return Math.round(totalMinutes);
}

// Helper function to format total minutes into a readable string
export function formatTotalTime(totalMinutes: number): string {
  if (totalMinutes === 0) return ''; // Don't display if no time estimated
  
  if (totalMinutes < 60) {
    return `~${totalMinutes} min`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) {
      return `~${hours} hr`;
    } else {
        // Simple rounding for display
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10; 
        return `~${totalHours} hrs`;
    }
  }
}

// Helper function to format a Date object into a readable string
export function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toLocaleDateString(undefined, { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
