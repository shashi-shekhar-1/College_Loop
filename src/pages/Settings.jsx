
import { useEffect, useState } from "react";
import {
  UserRound,
  Bell,
  Shield,
  Palette,
  Trash2,
  LogOut,
  LockKeyhole,
  Save,
  Sun,
  Moon,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth, db } from "../firebase";

const defaultSettings = {
  messageNotifications: true,
  wishlistNotifications: true,
  publicProfile: true,
  theme: "light",
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const snapshot = await getDoc(userRef);
          const saved = snapshot.exists()
            ? snapshot.data().settings
            : null;

          if (active && saved) {
            setSettings({
              ...defaultSettings,
              ...saved,
            });
          }
        }
      } catch (error) {
        console.error("Could not load settings:", error);
        if (active) {
          setMessage("Could not load saved preferences.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, [user?.uid]);

  // Apply theme immediately and remember it across refreshes.
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark"
    );
    localStorage.setItem("campus-loop-theme", settings.theme);
  }, [settings.theme]);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setMessage("");
  };

  const handleSave = async () => {
    if (!user) {
      setMessage("Please log in to save preferences.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { settings },
        { merge: true }
      );

      setMessage("Preferences saved successfully.");
    } catch (error) {
      console.error("Settings save error:", error);
      setMessage(
        "Could not save preferences. Check your Firestore rules."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user?.email) {
      setMessage("Please log in with your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage(`Password reset email sent to ${user.email}.`);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Could not send password reset email.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setMessage("Could not sign out. Please try again.");
    }
  };

  const Toggle = ({ checked, onChange, label }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  const SectionHeading = ({ icon: Icon, title, description, color }) => (
    <div className="mb-4 flex items-start gap-3">
      <div className={`rounded-full p-3 ${color}`}>
        <Icon size={21} />
      </div>
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );

  const Row = ({ title, description, children }) => (
    <div className="flex flex-col gap-3 border-t border-slate-100 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {title}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <div className="sm:ml-6">{children}</div>
    </div>
  );

  const sectionClass =
    "rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800";

  if (loading) {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-300">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account and preferences.
        </p>
      </div>

      <section className={sectionClass}>
        <SectionHeading
          icon={UserRound}
          title="Account"
          description="Manage your account information and security."
          color="bg-blue-50 text-blue-600"
        />
        <Row
          title="Email address"
          description="Your registered email address."
        >
          <span className="break-all text-sm text-slate-600 dark:text-slate-300">
            {user?.email || "Not connected"}
          </span>
        </Row>
        <Row
          title="Password"
          description="Receive an email to reset your password."
        >
          <button
            type="button"
            onClick={handlePasswordChange}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-white"
          >
            <LockKeyhole size={16} />
            Reset password
          </button>
        </Row>
      </section>

      <section className={sectionClass}>
        <SectionHeading
          icon={Bell}
          title="Notifications"
          description="Choose which updates you want to receive."
          color="bg-green-50 text-green-700"
        />
        <Row
          title="Messages and replies"
          description="Preference for message and request updates."
        >
          <Toggle
            label="Message notifications"
            checked={settings.messageNotifications}
            onChange={(v) => updateSetting("messageNotifications", v)}
          />
        </Row>
        <Row
          title="Wishlist updates"
          description="Preference for saved-resource updates."
        >
          <Toggle
            label="Wishlist notifications"
            checked={settings.wishlistNotifications}
            onChange={(v) => updateSetting("wishlistNotifications", v)}
          />
        </Row>
      </section>

      <section className={sectionClass}>
        <SectionHeading
          icon={Shield}
          title="Privacy"
          description="Control how your profile appears to other students."
          color="bg-purple-50 text-purple-600"
        />
        <Row
          title="Show my profile to students"
          description="Save your preference for profile visibility."
        >
          <Toggle
            label="Public profile"
            checked={settings.publicProfile}
            onChange={(v) => updateSetting("publicProfile", v)}
          />
        </Row>
      </section>

      <section className={sectionClass}>
        <SectionHeading
          icon={Palette}
          title="Appearance"
          description="Choose how Campus Loop looks."
          color="bg-orange-50 text-orange-600"
        />
        <Row title="Theme" description="Switch between light and dark mode.">
          <div className="flex flex-wrap gap-2">
            {["light", "dark"].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => updateSetting("theme", theme)}
                aria-pressed={settings.theme === theme}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                  settings.theme === theme
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
                }`}
              >
                {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </Row>
      </section>

      <section className={sectionClass}>
        <SectionHeading
          icon={Trash2}
          title="Account actions"
          description="Manage your Campus Loop account."
          color="bg-red-50 text-red-600"
        />
        <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium dark:border-slate-600 dark:text-white"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Account deletion is not enabled yet.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Save size={17} />
          {saving ? "Saving..." : "Save preferences"}
        </button>

        {message && (
          <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
