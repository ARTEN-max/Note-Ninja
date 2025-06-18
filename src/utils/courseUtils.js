/**
 * Formats a course code by adding a space between the subject prefix and course number
 * @param {string} courseCode - The course code (e.g., "CS246", "MATH137")
 * @returns {string} - The formatted course code (e.g., "CS 246", "MATH 137")
 */
export function formatCourseCode(courseCode) {
  if (!courseCode || typeof courseCode !== 'string') {
    return courseCode;
  }
  
  // Match letters at the beginning followed by numbers
  const match = courseCode.match(/^([A-Z]+)(\d+)$/);
  if (match) {
    const [, prefix, number] = match;
    return `${prefix} ${number}`;
  }
  
  // If no match, return the original course code
  return courseCode;
} 