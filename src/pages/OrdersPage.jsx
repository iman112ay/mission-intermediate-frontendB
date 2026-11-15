import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { footerGroups } from "../data/siteContent.js";
import { readOrders } from "../data/orders.js";
import "../styles/orders.css";

const PAGE_SIZE = 5;
const orderTabs = [
  { label: "Semua Pesanan", value: "all" },
  { label: "Menunggu", value: "menunggu" },
  { label: "Berhasil", value: "berhasil" },
  { label: "Gagal", value: "gagal" },
];
const statusLabels = {
  menunggu: "Menunggu",
  berhasil: "Berhasil",
  gagal: "Gagal",
};

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

function formatPaymentDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function OrdersPage({ courses, user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      setOrders(readOrders());
    } catch (loadError) {
      setError(`Pesanan tidak dapat dimuat: ${loadError.message}`);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders
      .filter((order) => {
        const course = courses.find((item) => item.id === order.courseId);
        const matchesStatus = status === "all" || order.status === status;
        const matchesSearch =
          !query ||
          order.invoice.toLowerCase().includes(query) ||
          course?.detailTitle.toLowerCase().includes(query) ||
          course?.title.toLowerCase().includes(query);
        return matchesStatus && matchesSearch;
      })
      .sort((first, second) =>
        sort === "oldest"
          ? new Date(first.createdAt) - new Date(second.createdAt)
          : new Date(second.createdAt) - new Date(first.createdAt),
      );
  }, [orders, search, sort, status]);

  const pageCount = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function resetPage(update) {
    return (event) => {
      update(event.target.value);
      setPage(1);
    };
  }

  return (
    <>
      <Header user={user} onLogout={onLogout} />
      <main className="orders-page container">
        <aside className="orders-sidebar">
          <h1>Daftar Pesanan</h1>
          <p>Informasi terperinci mengenai pembelian</p>
          <nav aria-label="Menu akun" className="orders-account-nav">
            <a href="/profile"><span aria-hidden="true">♟</span> Profil Saya</a>
            <a href="/my-classes"><span aria-hidden="true">▣</span> Kelas Saya</a>
            <a href="/orders" aria-current="page"><span aria-hidden="true">♧</span> Pesanan Saya</a>
          </nav>
        </aside>

        <section className="orders-panel" aria-label="Daftar pesanan">
          <div className="orders-toolbar">
            <div className="orders-tabs" role="tablist" aria-label="Filter status">
              {orderTabs.map((tab) => (
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
            <div className="orders-controls">
              <label className="orders-search">
                <span className="visually-hidden">Cari pesanan</span>
                <input
                  type="search"
                  placeholder="Cari Kelas"
                  value={search}
                  onChange={resetPage(setSearch)}
                />
                <span aria-hidden="true">⌕</span>
              </label>
              <label className="orders-sort">
                <span className="visually-hidden">Urutkan pesanan</span>
                <select value={sort} onChange={resetPage(setSort)}>
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                </select>
              </label>
            </div>
          </div>

          {error ? (
            <p className="orders-empty" role="alert">{error}</p>
          ) : visibleOrders.length ? (
            <div className="orders-list">
              {visibleOrders.map((order) => {
                const course = courses.find((item) => item.id === order.courseId);
                return (
                  <article className="order-card" key={order.invoice}>
                    <header className="order-card-header">
                      <p>
                        No. Invoice: <strong>{order.invoice}</strong>
                      </p>
                      <time dateTime={order.createdAt}>
                        {order.status === "menunggu" ? "Waktu Pemesanan" : "Waktu Pembayaran"}:{" "}
                        {formatPaymentDate(order.createdAt)}
                      </time>
                      <span className={`order-status status-${order.status}`}>
                        {statusLabels[order.status]}
                      </span>
                    </header>
                    <div className="order-card-course">
                      {course ? (
                        <>
                          <img src={course.image} alt="" />
                          <h2>{course.detailTitle}</h2>
                        </>
                      ) : (
                        <p>Kelas tidak lagi tersedia.</p>
                      )}
                      <div className="order-card-price">
                        <span>Harga</span>
                        <strong>{formatRupiah(order.coursePrice)}</strong>
                      </div>
                    </div>
                    <footer className="order-card-total">
                      <span>Total Pembayaran</span>
                      <strong>{formatRupiah(order.total)}</strong>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="orders-empty" role="status">
              <h2>{orders.length ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}</h2>
              <p>
                {orders.length
                  ? "Coba ubah status atau kata pencarian."
                  : "Pesanan kamu akan tampil di sini setelah checkout."}
              </p>
              <a href="/courses">Jelajahi kelas</a>
            </div>
          )}

          {pageCount > 1 && (
            <nav className="orders-pagination" aria-label="Halaman pesanan">
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
          <p className="orders-demo-note">
            Data pesanan demo disimpan hanya di browser ini.
          </p>
        </section>
      </main>
      <Footer groups={footerGroups} />
    </>
  );
}
