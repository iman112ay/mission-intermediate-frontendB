import { useEffect, useState } from "react";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { footerGroups } from "../data/siteContent.js";
import "../styles/profile.css";

export default function ProfilePage({ user, onLogout, onSave }) {
  const defaultPhoto = "https://i.pravatar.cc/160?img=47";
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [countryCode, setCountryCode] = useState(user.countryCode || "+62");
  const [phone, setPhone] = useState(user.phone || "");
  const [gender, setGender] = useState(user.gender || "");
  const [photoPreview, setPhotoPreview] = useState(user.avatar || defaultPhoto);
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Pilih foto berformat JPG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setMessage("Ukuran foto maksimal 1 MB.");
      event.target.value = "";
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const avatar = photoFile
        ? await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(photoFile);
          })
        : user.avatar;
      onSave({
        name: name.trim(),
        email: email.trim(),
        countryCode,
        phone: phone.trim(),
        gender,
        avatar,
      });
      setMessage("Profil berhasil disimpan.");
    } catch (error) {
      setMessage(
        error?.name === "QuotaExceededError"
          ? "Penyimpanan browser penuh; foto profil tidak dapat disimpan."
          : "Profil gagal disimpan. Periksa ruang penyimpanan browser lalu coba lagi.",
      );
    }
  }

  return (
    <>
      <Header user={user} onLogout={onLogout} />
      <main className="profile-section">
        <div className="profile-layout container">
          <aside className="profile-sidebar">
            <h1>Ubah Profil</h1>
            <p>Ubah data diri Anda</p>
            <nav aria-label="Menu akun" className="profile-account-nav">
              <a href="/profile" aria-current="page"><span aria-hidden="true">♟</span> Profil Saya</a>
              <a href="/my-classes"><span aria-hidden="true">▣</span> Kelas Saya</a>
              <a href="/orders"><span aria-hidden="true">♧</span> Pesanan Saya</a>
            </nav>
          </aside>

          <section className="profile-card" aria-label="Ubah data profil">
            <div className="profile-identity">
              <img src={photoPreview} alt="Foto profil" />
              <div>
                <h2>{name || "Nama Anda"}</h2>
                <p>{email}</p>
                <label className="profile-photo-button" htmlFor="profile-photo">
                  Ganti Foto Profil
                </label>
                <input
                  className="visually-hidden"
                  id="profile-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <label className="profile-field profile-name-field">
                <span>Nama Lengkap</span>
                <input
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="profile-field">
                <span>E-Mail</span>
                <input
                  autoComplete="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="profile-field profile-gender-field">
                <span>Jenis Kelamin</span>
                <select
                  required
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Laki-laki">Laki-laki</option>
                </select>
              </label>
              <div className="profile-phone-field">
                <label className="profile-field">
                  <span>Kode Negara</span>
                  <select
                    autoComplete="tel-country-code"
                    value={countryCode}
                    onChange={(event) => setCountryCode(event.target.value)}
                  >
                    <option value="+62">+62</option>
                    <option value="+60">+60</option>
                    <option value="+65">+65</option>
                  </select>
                </label>
                <label className="profile-field">
                  <span>No. HP</span>
                  <input
                    autoComplete="tel-national"
                    type="tel"
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
              </div>
              <div className="profile-form-footer">
                <p role="status">{message}</p>
                <button type="submit">Simpan</button>
              </div>
            </form>
          </section>
        </div>
      </main>
      <Footer groups={footerGroups} />
    </>
  );
}
