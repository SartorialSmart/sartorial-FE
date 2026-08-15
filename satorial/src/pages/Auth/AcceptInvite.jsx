import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { message } from "antd";
import { toast } from "react-toastify";
import StaffService from "../../services/staffServices/StaffService";
import { extractErrorMessage } from "../../../utils/errorUtils";

const initialForm = {
  first_name: "",
  last_name: "",
  phone_number: "",
  password: "",
  confirm_password: "",
};

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const uid = params.get("uid");
  const token = params.get("token");

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const invalidLink = !uid || !token;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      message.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm_password) {
      message.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await StaffService.acceptInvite({
        uid,
        token,
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        password: form.password,
      });
      message.success("Account set up successfully. Please log in.");
      navigate("/login");
    } catch (err) {
      const errMsg = extractErrorMessage(err, "This invitation is invalid or has expired.");
      toast.error(errMsg);
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Set up your account</h1>
        <p className="mt-1 text-sm text-slate-600">
          You&apos;ve been given access to Sartorial Smart. Confirm your details and choose a password — then you
          can sign in and get to work on whatever your organization has given you access to.
        </p>

        {invalidLink ? (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            This invitation link is invalid or incomplete. Please ask your organization to resend the invite.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">First name</label>
                <input name="first_name" value={form.first_name} onChange={onChange} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Last name</label>
                <input name="last_name" value={form.last_name} onChange={onChange} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone number</label>
              <input name="phone_number" value={form.phone_number} onChange={onChange} required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange} required minLength={8}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Confirm password</label>
              <input type="password" name="confirm_password" value={form.confirm_password} onChange={onChange} required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {submitting ? "Setting up…" : "Activate my account"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-slate-500">
          Already set up? <Link to="/login" className="text-indigo-600">Log in</Link>
        </p>
      </div>
    </div>
  );
}
