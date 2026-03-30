import { FormEvent, useEffect, useState } from "react";
import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";

function getRoleLandingPath(role: string) {
  if (role === "admin") {
    return "/app/review";
  }

  if (role === "manager") {
    return "/app/update-status";
  }

  return "/app/request";
}

export function Login() {
  const navigate = useNavigate();
  const { currentUser, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate(getRoleLandingPath(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const user = await login(email, password);
      navigate(getRoleLandingPath(user.role), { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fef3c7_0%,#dcfce7_45%,#dbeafe_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border-2 border-black bg-white/90 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] backdrop-blur">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-black bg-lime-200 px-4 py-2 text-sm font-bold">
            <ShieldCheck size={16} />
            Smart Classroom Resource Allocation System
          </div>
          <h1 className="mb-4 text-5xl font-handwriting leading-tight">
            Login To Access Your Classroom Resource Dashboard
          </h1>
          <p className="max-w-2xl text-lg text-gray-700">
            Sign in as faculty, admin, or resource manager to submit requests,
            review live availability, and track resource approvals in one place.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Faculty",
                value: "faculty@smartclass.edu / faculty123",
              },
              {
                label: "Admin",
                value: "admin@smartclass.edu / admin123",
              },
              {
                label: "Manager",
                value: "manager@smartclass.edu / manager123",
              },
            ].map((account) => (
              <div
                key={account.label}
                className="rounded-2xl border-2 border-black bg-yellow-50 p-4"
              >
                <div className="mb-2 font-bold">{account.label}</div>
                <div className="text-sm text-gray-700">{account.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-lime-200">
              <UserRound size={30} />
            </div>
            <div>
              <h2 className="text-3xl font-handwriting">User Login</h2>
              <p className="text-sm text-gray-600">
                Database-backed credential verification with role-based redirect.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="h-12 w-full rounded-xl border-2 border-black px-4"
                disabled={isLoading || isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border-2 border-black px-4 pr-11"
                  disabled={isLoading || isSubmitting}
                  required
                />
                <KeyRound className="pointer-events-none absolute right-3 top-3" size={20} />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full rounded-xl border-2 border-black bg-lime-300 px-5 py-3 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:shadow-none"
            >
              {isSubmitting ? "Signing In..." : "Login"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
