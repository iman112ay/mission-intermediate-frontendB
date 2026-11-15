import { useEffect, useState } from "react";
import CourseCatalogPage from "./pages/CourseCatalogPage.jsx";
import CourseDetailPage from "./pages/CourseDetailPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyClassesPage from "./pages/MyClassesPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { initialCourses, readSavedCourses, saveCourses } from "./data/courseStore.js";
import "./styles/home.css";
import "./styles/auth.css";

const USER_EMAIL_KEY = "videobelajar-user-email";
const USER_NAME_KEY = "videobelajar-user-name";
const USER_PHONE_KEY = "videobelajar-user-phone";
const USER_COUNTRY_CODE_KEY = "videobelajar-user-country-code";
const USER_AVATAR_KEY = "videobelajar-user-avatar";
const USER_GENDER_KEY = "videobelajar-user-gender";
const USER_ROLE_KEY = "videobelajar-user-role";

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const [courses, setCourses] = useState(initialCourses);
  const [courseLoadError, setCourseLoadError] = useState("");
  const [user, setUser] = useState(() => ({
    email: window.localStorage.getItem(USER_EMAIL_KEY) || "",
    name: window.localStorage.getItem(USER_NAME_KEY) || "",
    phone: window.localStorage.getItem(USER_PHONE_KEY) || "",
    countryCode: window.localStorage.getItem(USER_COUNTRY_CODE_KEY) || "+62",
    avatar: window.localStorage.getItem(USER_AVATAR_KEY) || "",
    gender: window.localStorage.getItem(USER_GENDER_KEY) || "",
    role: window.localStorage.getItem(USER_ROLE_KEY) === "admin" ? "admin" : "user",
  }));

  useEffect(() => {
    try {
      const savedCourses = readSavedCourses();
      if (savedCourses) setCourses(savedCourses);
    } catch (error) {
      setCourseLoadError(`Data kelas tersimpan tidak dapat dimuat: ${error.message}`);
    }
  }, []);

  function updateCourses(nextCourses) {
    if (user.role !== "admin") {
      throw new Error("Hanya admin yang dapat mengubah data kelas.");
    }
    saveCourses(nextCourses);
    setCourses(nextCourses);
    setCourseLoadError("");
  }

  function signIn({ email, name, phone, countryCode, role = "user" }) {
    const userRole = role === "admin" ? "admin" : "user";
    const savedPhone = phone ?? window.localStorage.getItem(USER_PHONE_KEY) ?? "";
    const savedCountryCode =
      countryCode ?? window.localStorage.getItem(USER_COUNTRY_CODE_KEY) ?? "+62";
    window.localStorage.setItem(USER_EMAIL_KEY, email);
    window.localStorage.setItem(USER_NAME_KEY, name);
    window.localStorage.setItem(USER_PHONE_KEY, savedPhone);
    window.localStorage.setItem(USER_COUNTRY_CODE_KEY, savedCountryCode);
    window.localStorage.setItem(USER_ROLE_KEY, userRole);
    setUser({
      email,
      name,
      phone: savedPhone,
      countryCode: savedCountryCode,
      avatar: window.localStorage.getItem(USER_AVATAR_KEY) || "",
      gender: window.localStorage.getItem(USER_GENDER_KEY) || "",
      role: userRole,
    });
    const next = new URLSearchParams(window.location.search).get("next");
    const destination =
      next?.startsWith("/") && !next.startsWith("//") ? next : "/";
    window.location.href = destination;
  }

  function signOut() {
    window.localStorage.removeItem(USER_EMAIL_KEY);
    window.localStorage.removeItem(USER_NAME_KEY);
    window.localStorage.removeItem(USER_PHONE_KEY);
    window.localStorage.removeItem(USER_COUNTRY_CODE_KEY);
    window.localStorage.removeItem(USER_AVATAR_KEY);
    window.localStorage.removeItem(USER_GENDER_KEY);
    window.localStorage.removeItem(USER_ROLE_KEY);
    setUser({ email: "", name: "", phone: "", countryCode: "+62", avatar: "", gender: "", role: "user" });
  }

  function saveProfile(profile) {
    if (profile.avatar) {
      window.localStorage.setItem(USER_AVATAR_KEY, profile.avatar);
    }
    window.localStorage.setItem(USER_EMAIL_KEY, profile.email);
    window.localStorage.setItem(USER_NAME_KEY, profile.name);
    window.localStorage.setItem(USER_PHONE_KEY, profile.phone);
    window.localStorage.setItem(USER_COUNTRY_CODE_KEY, profile.countryCode);
    window.localStorage.setItem(USER_GENDER_KEY, profile.gender);
    setUser((currentUser) => ({ ...currentUser, ...profile }));
  }

  useEffect(() => {
    document.title =
      path === "/login"
        ? "Login - Videobelajar"
        : path === "/register"
          ? "Pendaftaran Akun - Videobelajar"
          : path === "/courses"
            ? "Katalog Kelas - Videobelajar"
            : path.startsWith("/courses/")
              ? "Detail Kelas - Videobelajar"
              : path === "/orders"
                ? "Daftar Pesanan - Videobelajar"
                : path === "/profile"
                  ? "Ubah Profil - Videobelajar"
                  : path === "/my-classes"
                    ? "Kelas Saya - Videobelajar"
                    : path === "/payment"
                      ? "Pembayaran - Videobelajar"
                      : "VideoBelajar — Platform Video Pembelajaran";
  }, [path]);

  useEffect(() => {
    if (
      (path === "/payment" ||
        path === "/orders" ||
        path === "/my-classes" ||
        path === "/profile") &&
      !user.email
    ) {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [path, user.email]);

  useEffect(() => {
    if (
      user.role === "admin" &&
      ["/payment", "/orders", "/my-classes"].includes(path)
    ) {
      window.location.replace("/");
    }
  }, [path, user.role]);

  if (path === "/login") {
    return <LoginPage onLogin={signIn} />;
  }

  if (path === "/register") {
    return <RegisterPage onRegister={signIn} />;
  }

  if (path === "/courses") {
    return <CourseCatalogPage courses={courses} user={user} onLogout={signOut} />;
  }

  if (path.startsWith("/courses/")) {
    const courseId = Number(path.split("/")[2]);
    return (
      <CourseDetailPage
        course={courses.find((course) => course.id === courseId)}
        courses={courses}
        user={user}
        onLogout={signOut}
      />
    );
  }

  if (path === "/payment") {
    if (user.role === "admin") return null;
    return <PaymentPage courses={courses} user={user} onLogout={signOut} />;
  }

  if (path === "/orders") {
    if (user.role === "admin") return null;
    return <OrdersPage courses={courses} user={user} onLogout={signOut} />;
  }

  if (path === "/profile") {
    return <ProfilePage user={user} onLogout={signOut} onSave={saveProfile} />;
  }

  if (path === "/my-classes") {
    if (user.role === "admin") return null;
    return <MyClassesPage courses={courses} user={user} onLogout={signOut} />;
  }

  return (
    <HomePage
      courses={courses}
      courseLoadError={courseLoadError}
      onCoursesChange={updateCourses}
      isAdmin={user.role === "admin"}
      user={user}
      onLogout={signOut}
    />
  );
}
