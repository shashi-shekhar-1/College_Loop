import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(credential.user, {
          displayName: name.trim(),
        });
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }

      navigate("/");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/weak-password": "Use a stronger password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Check your internet connection.",
      };

      setError(
        messages[err.code] ||
        err.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          to="/"
          className="text-sm font-semibold text-blue-600"
        >
          Campus Loop
        </Link>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {isSignup
            ? "Join your campus marketplace."
            : "Log in to continue to Campus Loop."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignup && (
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                required
                autoComplete="name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={
                isSignup ? "new-password" : "current-password"
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Log In"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="font-semibold text-blue-600 hover:underline"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
