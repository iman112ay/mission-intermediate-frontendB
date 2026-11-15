import { useEffect, useState } from "react";
import { saveOrder } from "../data/orders.js";
import finishIllustration from "../img/finish-female.png";
import "../styles/payment.css";

const adminFee = 7000;
const paymentGroups = [
  {
    title: "Transfer Bank",
    type: "bank",
    methods: [
      { id: "bca", name: "Bank BCA", mark: "BCA" },
      { id: "bni", name: "Bank BNI", mark: "BNI" },
      { id: "bri", name: "Bank BRI", mark: "BRI" },
      { id: "mandiri", name: "Bank Mandiri", mark: "MANDIRI" },
    ],
  },
  {
    title: "E-Wallet",
    type: "ewallet",
    methods: [
      { id: "dana", name: "DANA", mark: "DANA" },
      { id: "ovo", name: "OVO", mark: "OVO" },
      { id: "linkaja", name: "LinkAja", mark: "LinkAja" },
      { id: "shopeepay", name: "ShopeePay", mark: "SPay" },
    ],
  },
  {
    title: "Kartu Kredit/Debit",
    type: "card",
    methods: [
      { id: "visa", name: "Visa", mark: "VISA" },
      { id: "mastercard", name: "Mastercard", mark: "mastercard" },
    ],
  },
];

const bcaInstructions = [
  {
    title: "ATM BCA",
    steps: [
      "Masukkan kartu ATM dan PIN BCA Anda.",
      "Pilih menu Transaksi Lainnya, Transfer, lalu pilih Ke BCA Virtual Account.",
      "Masukkan nomor Virtual Account dan pastikan data pembayaran benar.",
      "Periksa jumlah pembayaran, lalu konfirmasi transaksi.",
    ],
  },
  {
    title: "Mobile Banking BCA",
    steps: [
      "Buka aplikasi BCA Mobile dan pilih m-Transfer.",
      "Pilih BCA Virtual Account.",
      "Masukkan nomor Virtual Account dan tekan OK.",
      "Periksa detail pembayaran, lalu konfirmasi dengan PIN m-BCA.",
    ],
  },
  {
    title: "Internet Banking BCA",
    steps: [
      "Login ke KlikBCA Individual.",
      "Pilih Transfer Dana, lalu Transfer ke BCA Virtual Account.",
      "Masukkan nomor Virtual Account dan periksa detail transaksi.",
      "Ikuti instruksi untuk menyelesaikan pembayaran.",
    ],
  },
];

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function PaymentPage({ courses }) {
  const courseId = Number(new URLSearchParams(window.location.search).get("courseId"));
  const course = courses.find((item) => item.id === courseId);
  const [selectedMethod, setSelectedMethod] = useState("bca");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("select");
  const [timeRemaining, setTimeRemaining] = useState(50 * 60 + 55);

  useEffect(() => {
    if (step !== "pay") return undefined;
    const timer = window.setInterval(() => {
      setTimeRemaining((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  if (!course) {
    return (
      <div className="payment-shell">
        <header className="payment-header">
          <a className="payment-logo" href="/">videobelajar</a>
        </header>
        <main className="payment-content">
          <section className="payment-not-found">
            <h1>Kelas tidak ditemukan</h1>
            <p>Pilih kelas dari katalog sebelum melanjutkan pembayaran.</p>
            <a href="/courses">Kembali ke katalog kelas</a>
          </section>
        </main>
      </div>
    );
  }

  const total = course.priceValue + adminFee;
  const methodGroup = paymentGroups.find((group) =>
    group.methods.some((method) => method.id === selectedMethod),
  );
  const method = methodGroup.methods.find(
    (item) => item.id === selectedMethod,
  );

  async function copyVirtualAccount() {
    try {
      await navigator.clipboard.writeText("11739 081234567890");
      setMessage("Nomor Virtual Account demo berhasil disalin.");
    } catch {
      setMessage("Nomor tidak dapat disalin. Silakan salin secara manual.");
    }
  }

  function finishDemoOrder() {
    try {
      saveOrder({
        invoice: `HEI/VI/${Date.now()}`,
        courseId: course.id,
        coursePrice: course.priceValue,
        adminFee,
        total,
        method: method.name,
        createdAt: new Date().toISOString(),
        status: "menunggu",
      });
      setMessage("");
      setStep("complete");
    } catch (error) {
      setMessage(`Pesanan demo tidak dapat disimpan: ${error.message}`);
    }
  }

  return (
    <div className="payment-shell">
      <header className="payment-header">
        <a className="payment-logo" href="/">videobelajar</a>
        <ol className="payment-steps" aria-label="Tahapan pembayaran">
          <li
            className={step === "pay" || step === "complete" ? "is-complete" : ""}
            aria-current={step === "select" || step === "change" ? "step" : undefined}
          >
            <span>{step === "pay" || step === "complete" ? "✓" : "1"}</span>Pilih Metode
          </li>
          <li
            className={step === "complete" ? "is-complete" : ""}
            aria-current={step === "pay" ? "step" : undefined}
          >
            <span>{step === "complete" ? "✓" : "2"}</span>Bayar
          </li>
          <li aria-current={step === "complete" ? "step" : undefined}>
            <span>3</span>Selesai
          </li>
        </ol>
      </header>

      {step === "pay" && (
        <div className="payment-countdown" role="timer">
          Selesaikan pemesanan dalam
          <strong>
            {String(Math.floor(timeRemaining / 3600)).padStart(2, "0")} :{" "}
            {String(Math.floor((timeRemaining % 3600) / 60)).padStart(2, "0")} :{" "}
            {String(timeRemaining % 60).padStart(2, "0")}
          </strong>
        </div>
      )}

      {step === "complete" ? (
        <main className="payment-content payment-success-content">
          <section className="payment-success" aria-labelledby="payment-success-title">
            <img
              className="payment-success-illustration"
              src={finishIllustration}
              alt="Ilustrasi pembayaran berhasil"
            />
            <h1 id="payment-success-title">Pembayaran Berhasil!</h1>
            <p>
              Silakan cek email kamu untuk informasi lebih lanjut. Hubungi kami
              jika ada kendala.
            </p>
            <p className="payment-success-demo-note">
              Simulasi saja: pembayaran belum diproses dan tidak ada dana yang ditarik.
            </p>
            <a className="payment-submit payment-details-toggle" href="/orders">
              Lihat Detail Pesanan
            </a>
          </section>
        </main>
      ) : (
      <main className="payment-content">
        <div className="payment-layout">
          <div className="payment-main">
            {step === "select" || step === "change" ? (
              <>
                {step === "change" && (
                  <OrderSummary
                    course={course}
                    adminFee={adminFee}
                    total={total}
                    hideAction
                  />
                )}
                <section className="payment-panel">
                  <h1>{step === "change" ? "Ubah Metode Pembayaran" : "Metode Pembayaran"}</h1>
                  <div className="payment-method-groups">
                    {paymentGroups.map((group, index) => (
                      <details
                        className="payment-method-group"
                        key={group.title}
                        open={step === "select" && index === 0}
                      >
                        <summary>{group.title}</summary>
                        <div className="payment-method-options">
                          {group.methods.map((item) => (
                            <label className="payment-method-option" key={item.id}>
                              <span className={`payment-method-mark mark-${item.id}`}>
                                {item.mark}
                              </span>
                              <span>{item.name}</span>
                              <input
                                type="radio"
                                name="payment-method"
                                value={item.id}
                                checked={selectedMethod === item.id}
                                onChange={() => {
                                  setSelectedMethod(item.id);
                                  setMessage("");
                                }}
                              />
                            </label>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                  {step === "change" && (
                    <button
                      className="payment-submit"
                      type="button"
                      onClick={() => {
                        setStep("pay");
                        setMessage("");
                      }}
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </section>
                {step === "select" && (
                  <OrderSummary
                    course={course}
                    adminFee={adminFee}
                    total={total}
                    onContinue={() => {
                      setStep("pay");
                      setMessage("");
                    }}
                    actionLabel="Bayar Sekarang"
                  />
                )}
              </>
            ) : (
              <>
                <section className="payment-panel">
                  <h1>Metode Pembayaran</h1>
                  <div className="payment-virtual-account">
                    <span className={`payment-method-mark mark-${method.id}`}>
                      {method.mark}
                    </span>
                    <p>{method.name}</p>
                    {method.id === "bca" ? (
                      <>
                        <strong>Bayar Melalui Virtual Account BCA</strong>
                        <div className="virtual-account-number">
                          <span>11739 081234567890</span>
                          <button type="button" onClick={copyVirtualAccount}>Salin</button>
                        </div>
                        <p className="payment-demo-note">
                          Nomor ini hanya contoh untuk tampilan demo. Jangan lakukan transfer.
                        </p>
                      </>
                    ) : (
                      <p className="payment-demo-note">
                        Detail pembayaran {method.name} belum tersedia karena gateway pembayaran belum terhubung.
                      </p>
                    )}
                  </div>
                  {message && <p className="payment-message" role="status">{message}</p>}
                  <OrderSummary
                    course={course}
                    adminFee={adminFee}
                    total={total}
                    onContinue={finishDemoOrder}
                    actionLabel="Bayar Sekarang"
                    onBack={() => {
                      setStep("change");
                      setMessage("");
                    }}
                  />
                </section>

                <section className="payment-panel payment-instructions">
                  <h2>Tata Cara Pembayaran</h2>
                  {method.id === "bca" ? (
                    bcaInstructions.map((instruction) => (
                      <details key={instruction.title} open>
                        <summary>{instruction.title}</summary>
                        <ol>
                          {instruction.steps.map((item) => <li key={item}>{item}</li>)}
                        </ol>
                      </details>
                    ))
                  ) : (
                    <p className="payment-demo-note">
                      Instruksi pembayaran resmi belum tersedia untuk metode ini karena gateway belum terhubung.
                    </p>
                  )}
                </section>
              </>
            )}
          </div>

          <aside className="payment-course-card" aria-label="Detail kelas">
            <img src={course.image} alt={course.imageAlt} />
            <h2>{course.detailTitle}</h2>
            <div className="payment-course-price">
              <strong>{formatRupiah(course.priceValue)}</strong>
              <del>{formatRupiah(course.priceValue * 2)}</del>
              <span>Diskon 50%</span>
            </div>
            <h3>Kelas Ini Sudah Termasuk</h3>
            <ul>
              <li><span aria-hidden="true">▣</span>Kelas online</li>
              <li><span aria-hidden="true">◷</span>{course.durationHours} jam belajar</li>
              <li><span aria-hidden="true">⌖</span>{course.studyArea}</li>
              <li><span aria-hidden="true">◎</span>{course.instructorName}</li>
            </ul>
            <h3>Bahasa Pengantar</h3>
            <p className="payment-language"><span aria-hidden="true">◎</span> Bahasa Indonesia</p>
          </aside>
        </div>
      </main>
      )}
    </div>
  );
}

function OrderSummary({
  course,
  adminFee,
  total,
  onContinue,
  actionLabel,
  onBack,
  hideAction = false,
}) {
  return (
    <section className={`payment-panel order-summary${onBack ? " order-summary--embedded" : ""}`}>
      <h2>Ringkasan Pesanan</h2>
      <div className="order-line">
        <span>Video Learning: {course.detailTitle}</span>
        <strong>{formatRupiah(course.priceValue)}</strong>
      </div>
      <div className="order-line">
        <span>Biaya Admin</span>
        <strong>{formatRupiah(adminFee)}</strong>
      </div>
      <div className="order-total">
        <strong>Total Pembayaran</strong>
        <strong>{formatRupiah(total)}</strong>
      </div>
      {!hideAction && (
        <div className={onBack ? "payment-actions" : ""}>
          {onBack && (
            <button className="payment-change-method" type="button" onClick={onBack}>
              Ganti Metode Pembayaran
            </button>
          )}
          <button className="payment-submit" type="button" onClick={onContinue}>
            {actionLabel}
          </button>
        </div>
      )}
    </section>
  );
}
