import { courses } from "./courses.js";

export const COURSES_STORAGE_KEY = "videobelajar-courses";

function isCourse(course) {
  return (
    course &&
    typeof course === "object" &&
    Number.isInteger(course.id) &&
    typeof course.title === "string" &&
    typeof course.detailTitle === "string" &&
    typeof course.description === "string" &&
    typeof course.instructorName === "string" &&
    typeof course.instructorTitle === "string" &&
    typeof course.studyArea === "string" &&
    typeof course.image === "string" &&
    typeof course.imageAlt === "string" &&
    typeof course.instructorImage === "string" &&
    typeof course.price === "string" &&
    Number.isFinite(course.priceValue) &&
    Number.isFinite(course.durationHours) &&
    Number.isFinite(Number(course.rating)) &&
    Number.isInteger(course.reviewCount) &&
    (course.curriculum === undefined || Array.isArray(course.curriculum))
  );
}

export function readSavedCourses() {
  const savedCourses = window.localStorage.getItem(COURSES_STORAGE_KEY);
  if (!savedCourses) return null;

  const parsedCourses = JSON.parse(savedCourses);
  if (
    !Array.isArray(parsedCourses) ||
    !parsedCourses.every(isCourse) ||
    new Set(parsedCourses.map((course) => course.id)).size !== parsedCourses.length
  ) {
    throw new Error("Format data kelas tersimpan tidak valid.");
  }
  return parsedCourses;
}

export function saveCourses(nextCourses) {
  if (
    !Array.isArray(nextCourses) ||
    !nextCourses.every(isCourse) ||
    new Set(nextCourses.map((course) => course.id)).size !== nextCourses.length
  ) {
    throw new Error("Data kelas tidak valid.");
  }
  window.localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(nextCourses));
}

export { courses as initialCourses };
