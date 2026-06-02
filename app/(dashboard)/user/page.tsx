"use client";

import { useState, useEffect, useTransition } from "react";
import PortalModal from "@/components/PortalModal";
import {
  getUsers,
  addUserAction,
  editUserAction,
  deleteUserAction,
} from "@/actions/users";

type User = {
  id: number;
  username: string;
  nama_lengkap: string;
  created_at: Date;
};

type Msg = { type: "success" | "error"; text: string };

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userPage, setUserPage] = useState<number>(1);
  const [userPageSize] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [pageMsg, setPageMsg] = useState<Msg | null>(null);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [formMsg, setFormMsg] = useState<Msg | null>(null);

  const [isPending, startTransition] = useTransition();

  const loadUsers = async () => {
    setLoading(true);
    const res = await getUsers();
    if (res.success && res.data) {
      setUsers(res.data as User[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const pagedUsers = users.slice(
    (userPage - 1) * userPageSize,
    userPage * userPageSize,
  );

  // Auto-dismiss page messages
  useEffect(() => {
    if (!pageMsg) return;
    const t = setTimeout(() => setPageMsg(null), 3500);
    return () => clearTimeout(t);
  }, [pageMsg]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!showAdd && !showEdit) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showAdd, showEdit]);

  const openAdd = () => {
    setFormMsg(null);
    setShowAdd(true);
  };

  const openEdit = (user: User) => {
    setSelected(user);
    setFormMsg(null);
    setShowEdit(true);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addUserAction(null, formData);
      if (res.success) {
        setShowAdd(false);
        setPageMsg({ type: "success", text: res.message! });
        await loadUsers();
        (e.target as HTMLFormElement).reset();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await editUserAction(null, formData);
      if (res.success) {
        setShowEdit(false);
        setSelected(null);
        setPageMsg({ type: "success", text: res.message! });
        await loadUsers();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleDelete = (user: User) => {
    if (!confirm(`Yakin ingin menghapus pengguna "${user.username}"?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", String(user.id));
      const res = await deleteUserAction(null, formData);
      if (res.success) {
        setPageMsg({ type: "success", text: res.message! });
        await loadUsers();
      } else {
        setPageMsg({ type: "error", text: res.error! });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data pengguna sistem — tambah, edit, atau hapus.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Pengguna
        </button>
      </div>

      {/* ── Alert Banner ── */}
      {pageMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
            pageMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {pageMsg.type === "success" ? (
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {pageMsg.text}
        </div>
      )}

      {/* ── Users Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Memuat data...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">No</th>
                    <th className="py-4 px-6 font-semibold">Pengguna</th>
                    <th className="py-4 px-6 font-semibold">Nama Lengkap</th>
                    <th className="py-4 px-6 font-semibold">Tanggal Dibuat</th>
                    <th className="py-4 px-6 font-semibold text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pagedUsers.map((user, i) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-6 text-slate-500 text-sm">
                        {(userPage - 1) * userPageSize + i + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-sm">
                        {user.nama_lengkap}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-sm">
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                            title="Edit"
                            aria-label={`Edit ${user.username}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isPending}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="Hapus"
                            aria-label={`Hapus ${user.username}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <svg
                            className="w-10 h-10 text-slate-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <p className="text-sm font-medium">
                            Belum ada pengguna
                          </p>
                          <p className="text-xs text-slate-300">
                            Klik "Tambah Pengguna" untuk mulai
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* pagination controls */}
            <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Total {users.length} pengguna
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border rounded-md text-sm"
                  disabled={userPage === 1}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setUserPage((p) => p + 1)}
                  className="px-3 py-1.5 border rounded-md text-sm"
                  disabled={userPage * userPageSize >= users.length}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════════ ADD MODAL ══════════════ */}
      {showAdd && (
        <PortalModal onClose={() => setShowAdd(false)}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Tambah Pengguna
              </h2>
            </div>
            <button
              onClick={() => setShowAdd(false)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Tutup"
              aria-label="Tutup modal tambah pengguna"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAdd} className="p-6 space-y-4">
            {formMsg && (
              <div
                className={`text-sm p-3 rounded-lg ${formMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
              >
                {formMsg.text}
              </div>
            )}
            <div>
              <label htmlFor="add-username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="add-username"
                name="username"
                required
                placeholder="contoh: john_doe"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="add-nama_lengkap" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="add-nama_lengkap"
                name="nama_lengkap"
                required
                placeholder="contoh: John Doe"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="add-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="add-password"
                name="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                )}
                Simpan
              </button>
            </div>
          </form>
        </PortalModal>
      )}

      {/* ───═══════════ EDIT MODAL ══════════════ */}
      {showEdit && selected && (
        <PortalModal onClose={() => setShowEdit(false)}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Edit Pengguna
              </h2>
            </div>
            <button
              onClick={() => setShowEdit(false)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Tutup"
              aria-label="Tutup modal edit pengguna"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEdit} className="p-6 space-y-4">
            <input type="hidden" name="id" value={selected.id} />
            {formMsg && (
              <div
                className={`text-sm p-3 rounded-lg ${formMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
              >
                {formMsg.text}
              </div>
            )}
            <div>
              <label htmlFor="edit-username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="edit-username"
                name="username"
                required
                defaultValue={selected.username}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="edit-nama_lengkap" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="edit-nama_lengkap"
                name="nama_lengkap"
                required
                defaultValue={selected.nama_lengkap}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="edit-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password{" "}
                <span className="ml-1 text-xs text-slate-400 font-normal">
                  (kosongkan bila tidak diubah)
                </span>
              </label>
              <input
                type="password"
                id="edit-password"
                name="password"
                minLength={6}
                placeholder="Isi jika ingin ganti password"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                )}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </PortalModal>
      )}
    </div>
  );
}