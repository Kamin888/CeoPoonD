import React from "react";

export default function AuthScreen({
  authMode,
  authForm,
  setAuthForm,
  authError,
  authLoading,
  submitAuth,
  openAuth,
  goHome,
  returnHome,
}) {
  const registering = authMode === "register";

  return (
    <div className="ah">
      <div className="wrap">
        <header>
          <button className="logo logo-button" type="button" onClick={goHome} aria-label="หอหา ไปหน้าหลัก">หอ<span>หา</span></button>
          <button className="nav-link" onClick={returnHome}>กลับหน้าหลัก</button>
        </header>
        <main className="auth-page">
          <section className="auth-card">
            <h1>{registering ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</h1>
            <p>{registering ? "สร้างบัญชีเพื่อเตรียมลงประกาศหอพัก" : "เข้าสู่ระบบเพื่อใช้งานบัญชีของคุณ"}</p>
            <form onSubmit={submitAuth}>
              <label>
                อีเมล
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </label>
              <label>
                รหัสผ่าน
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  autoComplete={registering ? "new-password" : "current-password"}
                  minLength={8}
                  maxLength={72}
                  required
                />
              </label>
              {registering && (
                <label>
                  ยืนยันรหัสผ่าน
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(event) => setAuthForm({ ...authForm, confirmPassword: event.target.value })}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </label>
              )}
              {authError && <p className="form-error" role="alert">{authError}</p>}
              <button className="btn auth-submit" type="submit" disabled={authLoading}>
                {authLoading ? "กำลังดำเนินการ..." : registering ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
              </button>
            </form>
            <p className="auth-switch">
              {registering ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
              <button
                className="text-button"
                type="button"
                onClick={() => openAuth(registering ? "login" : "register")}
              >
                {registering ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </button>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
