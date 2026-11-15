import { useState } from "react";
import CourseCard from "../components/CourseCard.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { courseCategories, footerGroups } from "../data/siteContent.js";

const studyAreas = [
  "Digital & Teknologi",
  "Pemasaran",
  "Pengembangan Diri",
  "Bisnis Manajemen",
];
const fallbackImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";
const fallbackInstructorImage = "https://i.pravatar.cc/80?img=32";
const blankCourse = {
  title: "",
  description: "",
  instructorName: "",
  instructorTitle: "",
  studyArea: studyAreas[0],
  priceValue: "",
  durationHours: "",
  image: "",
};

function courseToForm(course) {
  return {
    title: course.title,
    description: course.description,
    instructorName: course.instructorName,
    instructorTitle: course.instructorTitle,
    studyArea: course.studyArea,
    priceValue: String(course.priceValue),
    durationHours: String(course.durationHours),
    image: course.image,
  };
}

export default function HomePage({
  courses,
  courseLoadError,
  onCoursesChange,
  isAdmin,
  user,
  onLogout,
}) {
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [message, setMessage] = useState("");

  function startCreate() {
    setEditingId(null);
    setForm({ ...blankCourse });
    setMessage("");
  }

  function startEdit(course) {
    setEditingId(course.id);
    setForm(courseToForm(course));
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const existingCourse = courses.find((course) => course.id === editingId);
    const baseCourse = existingCourse || {
      curriculum: [],
      rating: "5",
      reviewCount: 0,
      instructorImage: fallbackInstructorImage,
      imageAlt: "Ilustrasi kelas pembelajaran",
    };
    const priceValue = Number(form.priceValue);
    const updatedCourse = {
      ...baseCourse,
      id: editingId ?? Math.max(0, ...courses.map((course) => course.id)) + 1,
      title: form.title.trim(),
      detailTitle: form.title.trim(),
      description: form.description.trim(),
      instructorName: form.instructorName.trim(),
      instructorTitle: form.instructorTitle.trim(),
      studyArea: form.studyArea,
      priceValue,
      price: `Rp ${new Intl.NumberFormat("id-ID").format(priceValue)}`,
      durationHours: Number(form.durationHours),
      image: form.image.trim() || baseCourse.image || fallbackImage,
      imageAlt: form.title.trim(),
    };
    const nextCourses = existingCourse
      ? courses.map((course) =>
          course.id === editingId ? updatedCourse : course,
        )
      : [...courses, updatedCourse];

    try {
      onCoursesChange(nextCourses);
      setForm(null);
      setMessage(
        existingCourse ? "Kelas berhasil diperbarui." : "Kelas berhasil ditambahkan.",
      );
    } catch (error) {
      setMessage(`Perubahan tidak dapat disimpan: ${error.message}`);
    }
  }

  function handleDelete(course) {
    if (pendingDeleteId !== course.id) {
      setPendingDeleteId(course.id);
      setMessage("");
      return;
    }

    try {
      onCoursesChange(courses.filter((item) => item.id !== course.id));
      setPendingDeleteId(null);
      setMessage("Kelas berhasil dihapus.");
    } catch (error) {
      setMessage(`Kelas tidak dapat dihapus: ${error.message}`);
    }
  }

  return (
    <>
      <Header user={user} onLogout={onLogout} />
      <main>
        {isAdmin ? (
          <section className="admin-dashboard-overview container">
            <div>
              <span className="admin-dashboard-label">DASHBOARD ADMIN</span>
              <h1>Selamat datang, {user.name || "Admin"}</h1>
              <p>Kelola katalog kelas dan informasi pembelajaran dari sini.</p>
            </div>
            <div className="admin-dashboard-count">
              <strong>{courses.length}</strong>
              <span>Total Kelas</span>
            </div>
          </section>
        ) : (
          <section id="beranda" className="hero container">
            <div className="hero-content">
              <h1>
                Revolusi Pembelajaran: Temukan
                <br className="desktop-only" /> Ilmu Baru melalui Platform Video
                Interaktif!
              </h1>
              <p>
                Temukan ilmu baru yang menarik dan mendalam melalui koleksi video
                pembelajaran berkualitas tinggi. Tidak hanya itu, Anda juga dapat
                berpartisipasi dalam latihan interaktif yang akan meningkatkan
                pemahaman Anda.
              </p>
              <a href="#kelas" className="btn btn-primary">
                Temukan Video Course untuk Dipelajari!
              </a>
            </div>
          </section>
        )}

        <section id="kelas" className="courses container">
          <div className="section-heading">
            <h2>{isAdmin ? "Manajemen Kelas" : "Koleksi Video Pembelajaran Unggulan"}</h2>
            <p>
              {isAdmin
                ? "Tambah, perbarui, dan kelola kelas yang tersedia untuk user."
                : "Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!"}
            </p>
          </div>

          {!isAdmin && (
            <CategoryTabs
              categories={courseCategories}
              activeCategory={courseCategories[0]}
            />
          )}

          {isAdmin && <section className="course-management" aria-label="Kelola kursus">
            <div className="course-management-heading">
              <div>
                <h3>Kelola Kelas</h3>
                <p>Tambah, ubah, atau hapus kelas dari koleksi ini.</p>
              </div>
              <button
                type="button"
                className="course-management-add"
                onClick={form ? () => setForm(null) : startCreate}
                disabled={Boolean(courseLoadError)}
              >
                {form ? "Tutup Form" : "+ Tambah Kelas"}
              </button>
            </div>

            {courseLoadError && (
              <p className="course-management-message error" role="alert">
                {courseLoadError} Data tidak diubah agar perubahan tersimpan tidak hilang.
              </p>
            )}
            {message && (
              <p className="course-management-message" role="status">{message}</p>
            )}

            {form && (
              <form className="course-management-form" onSubmit={handleSubmit}>
                <h4>{editingId ? "Edit Kelas" : "Tambah Kelas Baru"}</h4>
                <label>
                  Nama Kelas
                  <input
                    required
                    maxLength="100"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                  />
                </label>
                <label>
                  Deskripsi
                  <textarea
                    required
                    maxLength="240"
                    rows="2"
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                  />
                </label>
                <div className="course-management-fields">
                  <label>
                    Nama Instruktur
                    <input
                      required
                      maxLength="80"
                      value={form.instructorName}
                      onChange={(event) =>
                        setForm({ ...form, instructorName: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Profesi Instruktur
                    <input
                      required
                      maxLength="100"
                      value={form.instructorTitle}
                      onChange={(event) =>
                        setForm({ ...form, instructorTitle: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Kategori
                    <select
                      value={form.studyArea}
                      onChange={(event) =>
                        setForm({ ...form, studyArea: event.target.value })
                      }
                    >
                      {studyAreas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Harga (Rupiah)
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      value={form.priceValue}
                      onChange={(event) =>
                        setForm({ ...form, priceValue: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Durasi (jam)
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      required
                      value={form.durationHours}
                      onChange={(event) =>
                        setForm({ ...form, durationHours: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    URL Gambar (opsional)
                    <input
                      type="url"
                      placeholder="https://..."
                      value={form.image}
                      onChange={(event) =>
                        setForm({ ...form, image: event.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="course-management-form-actions">
                  <button type="button" onClick={() => setForm(null)}>
                    Batal
                  </button>
                  <button type="submit" className="course-management-save">
                    {editingId ? "Simpan Perubahan" : "Simpan Kelas"}
                  </button>
                </div>
              </form>
            )}
          </section>}

          <div className="course-grid">
            {courses.length ? courses.map((course) => (
              <div className="home-course-item" key={course.id}>
                <CourseCard course={course} />
                {isAdmin && <div className="home-course-actions">
                  <button
                    type="button"
                    onClick={() => startEdit(course)}
                    disabled={Boolean(courseLoadError)}
                  >
                    Edit
                  </button>
                  {pendingDeleteId === course.id ? (
                    <>
                      <button
                        type="button"
                        className="delete"
                        onClick={() => handleDelete(course)}
                        disabled={Boolean(courseLoadError)}
                      >
                        Konfirmasi Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="delete"
                      onClick={() => handleDelete(course)}
                      disabled={Boolean(courseLoadError)}
                    >
                      Hapus
                    </button>
                  )}
                </div>}
              </div>
            )) : (
              <p className="course-management-empty" role="status">
                Belum ada kelas. Gunakan tombol Tambah Kelas untuk membuat kelas baru.
              </p>
            )}
          </div>
        </section>

        {!isAdmin && <section id="newsletter" className="newsletter container">
          <div className="newsletter-inner">
            <span>NEWSLETTER</span>
            <h2>Mau Belajar Lebih Banyak?</h2>
            <p>
              Daftarkan dirimu untuk mendapatkan informasi terbaru dan
              penawaran spesial dari program-program terbaik hari esok.
            </p>
            <form>
              <input
                type="email"
                name="email"
                placeholder="Masukkan Emailmu"
                aria-label="Email"
                autoComplete="email"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </section>}
      </main>
      <Footer groups={footerGroups} />
    </>
  );
}
