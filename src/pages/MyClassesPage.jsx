import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { readOrders } from "../data/orders.js";
import { footerGroups } from "../data/siteContent.js";
import "../styles/my-classes.css";

const PAGE_SIZE = 3;
const classTabs = [
  { label: "Semua Kelas", value: "all" },
  { label: "Sedang Berjalan", value: "in-progress" },
  { label: "Selesai", value: "completed" },
];

export default function MyClassesPage({ courses, user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      setOrders(readOrders());
    } catch (loadError) {
      setError(`Kelas tidak dapat dimuat: ${loadError.message}`);
    }
  }, []);

  const enrolledCourses = useMemo(() => {
    const enrolledIds = new Set(
      orders
        .filter((order) => order.status !== "gagal")
        .map((order) => order.courseId),
    );
    return courses.filter((course) => enrolledIds.has(course.id));
  }, [orders]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrolledCourses.filter((course) => {
      if (status === "completed") return false;
      return (
        !query ||
        `${course.title} ${course.detailTitle} ${course.instructorName}`
          .toLowerCase()
          .includes(query)
      );
    });
  }, [enrolledCourses, search, status]);

  const pageCount = Math.ceil(filteredCourses.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const visibleCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <>
      <Header user={user} onLogout={onLogout} />
      <main className="my-classes-page container">
        <aside className="my-classes-sidebar">
          <h1>Daftar Kelas</h1>
          <p>Akses Materi Belajar dan Mulailah Meningkatkan Pengetahuan Anda!</p>
          <nav aria-label="Menu akun" className="my-classes-account-nav">
            <a href="/profile"><span aria-hidden="true">♟</span> Profil Saya</a>
            <a href="/my-classes" aria-current="page"><span aria-hidden="true">▣</span> Kelas Saya</a>
            <a href="/orders"><span aria-hidden="true">♧</span> Pesanan Saya</a>
          </nav>
        </aside>

        <section className="my-classes-panel" aria-label="Kelas saya">
          <div className="my-classes-toolbar">
            <div className="my-classes-tabs" role="tablist" aria-label="Filter kelas">
              {classTabs.map((tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={status === tab.value}
                  className={status === tab.value ? "active" : ""}
                  key={tab.value}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <label className="my-classes-search">
              <span className="visually-hidden">Cari kelas</span>
              <input
                type="search"
                placeholder="Cari Kelas"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
              <span aria-hidden="true">⌕</span>
            </label>
          </div>

          {error ? (
            <p className="my-classes-empty" role="alert">{error}</p>
          ) : visibleCourses.length ? (
            <div className="my-classes-list">
              {visibleCourses.map((course) => {
                const moduleCount = course.curriculum?.length || 0;
                const durationMinutes = course.durationHours * 60;
                const progress = 28;
                return (
                  <article className="my-class-card" key={course.id}>
                    <header className="my-class-card-header">
                      <span>{moduleCount} Modul</span>
                      <span className="my-class-status">Sedang Berjalan</span>
                    </header>
                    <div className="my-class-content">
                      <img src={course.image} alt={course.imageAlt} />
                      <div className="my-class-info">
                        <h2>{course.detailTitle}</h2>
                        <p>{course.description}</p>
                        <div className="my-class-instructor">
                          <img src={course.instructorImage} alt="" />
                          <span>
                            <strong>{course.instructorName}</strong>
                            <small>{course.instructorTitle}</small>
                          </span>
                        </div>
                        <div className="my-class-meta">
                          <span>▤ {moduleCount} Modul</span>
                          <span>◷ {durationMinutes} Menit</span>
                        </div>
                      </div>
                    </div>
                    <footer className="my-class-progress">
                      <span>Progres Kelas: <strong>{progress}%</strong></span>
                      <div
                        className="my-class-progress-track"
                        role="progressbar"
                        aria-label={`Progres ${course.title}`}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={progress}
                      >
                        <span style={{ width: `${progress}%` }} />
                      </div>
                      <a href={`/courses/${course.id}`}>Lanjutkan Pembelajaran</a>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="my-classes-empty" role="status">
              <h2>
                {status === "completed"
                  ? "Belum ada kelas selesai"
                  : enrolledCourses.length
                    ? "Kelas tidak ditemukan"
                    : "Belum ada kelas"}
              </h2>
              <p>
                {status === "completed"
                  ? "Sertifikat akan tersedia setelah kelas diselesaikan."
                  : enrolledCourses.length
                  ? "Coba ubah kata pencarian."
                  : "Kelas yang kamu ikuti akan tampil di sini."}
              </p>
              <a href="/courses">Jelajahi kelas</a>
            </div>
          )}

          {pageCount > 1 && (
            <nav className="my-classes-pagination" aria-label="Halaman kelas">
              <button
                type="button"
                aria-label="Halaman sebelumnya"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                ‹
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    type="button"
                    className={pageNumber === currentPage ? "active" : ""}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label="Halaman berikutnya"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                ›
              </button>
            </nav>
          )}
          <p className="my-classes-demo-note">
            Daftar kelas berasal dari checkout demo; progres hanya contoh dan akses belajar belum diverifikasi.
          </p>
        </section>
      </main>
      <Footer groups={footerGroups} />
    </>
  );
}
