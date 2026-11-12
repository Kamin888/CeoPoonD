import React from "react";
import { Localized } from "../i18n.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AuthScreen({
  authForm,
  setAuthForm,
  authError,
  authLoading,
  submitAuth,
  goDashboard,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) {
  return (
    <Localized language={language}>
    <div className="ah">
      <div className="wrap">
        <header>
          <button className="logo logo-button" type="button" onClick={goDashboard} aria-label="Finzhome แดชบอร์ด">Finzhome</button>
          <nav>
            <ThemeToggle theme={theme} language={language} onToggle={onToggleTheme} />
            <button className="nav-link" type="button" onClick={onToggleLanguage}>{language === "th" ? "English" : "ไทย"}</button>
          </nav>
        </header>
        <main className="auth-page">
          <section className="auth-card">
            <h1>เข้าสู่ระบบผู้ดูแล</h1>
            <p>เข้าสู่ระบบด้วยบัญชีผู้ดูแลเพื่อใช้งานแดชบอร์ด</p>
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
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={72}
                  required
                />
              </label>
              {authError && <p className="form-error" role="alert">{authError}</p>}
              <button className="btn auth-submit" type="submit" disabled={authLoading}>
                {authLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
    </Localized>
  );
}
