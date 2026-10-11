
import { useState } from "react";
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

const defaultSettings = {
  messageNotifications: true,
  wishlistNotifications: true,
  publicProfile: true,
  theme: "light",
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateSetting = (key, value) => {
  setSettings((previous) => ({
    ...previous,
    [key]: value,
  }));

  if (key === "theme") {
    document.documentElement.classList.toggle(
      "dark",
      value === "dark"
    );
  }

  setMessage("");
};

  // Later: load saved preferences from Firebase Firestore.
  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      // Firebase saving will be added here.
      setSavedSettings({ ...settings });

      if (settings.theme !== savedSettings.theme) {
        document.documentElement.classList.toggle(
          "dark",
          settings.theme === "dark"
        );
      }

      setMessage("Preferences saved successfully.");
    } catch (error) {
      setMessage("Unable to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = () => {
    // Later: use Firebase Authentication's password reset flow.
    setMessage("Password change will be available after authentication is connected.");
  };

  const handleSignOut = () => {
    // Later: call Firebase signOut(auth).
    setMessage("Sign out will be available after authentication is connected.");
  };

  const handleDeleteAccount = () => {
    // Later: require confirmation and delete through Firebase securely.
    setMessage("Account deletion will be available after authentication is connected.");
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
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );

  const Row = ({ title, description, children }) => (
    <div className="flex flex-col gap-3 border-t border-slate-100 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="sm:ml-6">{children}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and preferences.
        </p>
      </div>

      {/* Account */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          icon={UserRound}
          title="Account"
          description="Manage your account information and security."
          color="bg-blue-50 text-blue-600"
        />

        <Row
          title="Email address"
          description="Your registered email will appear here after login."
        >
          <span className="text-sm text-slate-600">
            Not connected
          </span>
        </Row>

        <Row
          title="Password"
          description="Use a secure password for your account."
        >
          <button
            type="button"
            onClick={handlePasswordChange}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LockKeyhole size={16} />
            Change password
          </button>
        </Row>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          icon={Bell}
          title="Notifications"
          description="Choose which updates you want to receive."
          color="bg-green-50 text-green-700"
        />

        <Row
          title="Messages and replies"
          description="Get notified when someone messages you or replies to a request."
        >
          <Toggle
            label="Message notifications"
            checked={settings.messageNotifications}
            onChange={(value) =>
              updateSetting("messageNotifications", value)
            }
          />
        </Row>

        <Row
          title="Wishlist updates"
          description="Get updates about resources you have saved."
        >
          <Toggle
            label="Wishlist notifications"
            checked={settings.wishlistNotifications}
            onChange={(value) =>
              updateSetting("wishlistNotifications", value)
            }
          />
        </Row>
      </section>

      {/* Privacy */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          icon={Shield}
          title="Privacy"
          description="Control how your profile appears to other students."
          color="bg-purple-50 text-purple-600"
        />

        <Row
          title="Show my profile to students"
          description="Allow other students to view your profile and listings."
        >
          <Toggle
            label="Public profile"
            checked={settings.publicProfile}
            onChange={(value) => updateSetting("publicProfile", value)}
          />
        </Row>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          icon={Palette}
          title="Appearance"
          description="Choose how Campus Loop looks."
          color="bg-orange-50 text-orange-600"
        />

        <Row
          title="Theme"
          description="Select your preferred appearance."
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateSetting("theme", "light")}
              aria-pressed={settings.theme === "light"}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                settings.theme === "light"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Sun size={16} />
              Light
            </button>

            <button
              type="button"
              onClick={() => updateSetting("theme", "dark")}
              aria-pressed={settings.theme === "dark"}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                settings.theme === "dark"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Moon size={16} />
              Dark
            </button>
          </div>
        </Row>
      </section>

      {/* Account actions */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          icon={Trash2}
          title="Account actions"
          description="Manage your Campus Loop account."
          color="bg-red-50 text-red-600"
        />

        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={16} />
            Sign out
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Delete account
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Account actions will be connected to Firebase Authentication later.
        </p>
      </section>

      {/* Save preferences */}
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
          <p role="status" className="text-sm text-slate-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
