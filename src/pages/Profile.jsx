import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  GraduationCap,
  BookOpen,
  Pencil,
  Package,
  ClipboardList,
  Heart,
  Save,
  X,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    college: "BIT Sindri",
    department: "",
    academicYear: "",
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(profileRef);
        const saved = snapshot.exists() ? snapshot.data() : {};

        setForm({
          name: user.displayName || saved.name || "",
          college: saved.college || "BIT Sindri",
          department: saved.department || "",
          academicYear: saved.academicYear || "",
        });
      } catch (err) {
        console.error("Could not load profile:", err);
        setError("Could not load saved profile details.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!user) {
      setError("Please log in again.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Save name in Firebase Authentication.
      await updateProfile(auth.currentUser, {
        displayName: form.name.trim(),
      });

      // Save the complete profile in Firestore.
      // Merge preserves the existing wishlistIds field.
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: form.name.trim(),
          college: form.college.trim(),
          department: form.department.trim(),
          academicYear: form.academicYear,
        },
        { merge: true }
      );

      setForm((previous) => ({
        ...previous,
        name: form.name.trim(),
      }));

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Could not save profile:", err);
      setError(
        err.code === "permission-denied"
          ? "Firestore denied the save. Your users security rule must allow these profile fields."
          : "Could not save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const name =
    form.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Student";

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-blue-600">Campus Loop</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your student information.
        </p>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="flex flex-col items-start justify-between gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold uppercase text-blue-700">
            {name.slice(0, 2)}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {form.department || "Department not added"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {form.college || "College not added"} ·{" "}
              {form.academicYear || "Academic year not added"}
            </p>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setEditing(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </section>

      {editing ? (
        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Edit Your Information
          </h2>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Your login email is managed by Firebase Authentication.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              College
            </label>
            <input
              name="college"
              value={form.college}
              onChange={handleChange}
              maxLength={150}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
              placeholder="Enter your college"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              maxLength={150}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
              placeholder="e.g. Electronics & Communication Engineering"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Academic Year
            </label>
            <select
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="">Select academic year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              <X size={17} />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">
            Student Information
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <InfoItem
              icon={<Mail size={20} />}
              label="Email"
              value={user?.email || "Not added yet"}
            />
            <InfoItem
              icon={<GraduationCap size={20} />}
              label="College"
              value={form.college || "Not added yet"}
            />
            <InfoItem
              icon={<BookOpen size={20} />}
              label="Department"
              value={form.department || "Not added yet"}
            />
            <InfoItem
              icon={<UserRound size={20} />}
              label="Academic Year"
              value={form.academicYear || "Not added yet"}
            />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Your Campus Loop
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <ProfileLink
            to="/my-listings"
            icon={<Package size={22} />}
            title="My Listings"
            description="Manage your resources"
          />
          <ProfileLink
            to="/my-requests"
            icon={<ClipboardList size={22} />}
            title="My Requests"
            description="View your requests"
          />
          <ProfileLink
            to="/wishlist"
            icon={<Heart size={22} />}
            title="Wishlist"
            description="View saved resources"
          />
        </div>
      </section>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 break-words font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function ProfileLink({ to, icon, title, description }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
    >
      <div className="text-blue-600">{icon}</div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
