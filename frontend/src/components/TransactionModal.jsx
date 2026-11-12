import { useEffect, useState } from "react";
import { X } from "lucide-react";
export default function TransactionModal({
  open,
  onClose,
  onSave,
  categories,
  initial,
}) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    kind: "expense",
    category_id: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              ...initial,
              amount: String(initial.amount),
              category_id: String(initial.category_id),
            }
          : {
              title: "",
              amount: "",
              kind: "expense",
              category_id: "",
              transaction_date: new Date().toISOString().slice(0, 10),
              note: "",
            },
      );
      setError("");
    }
  }, [open, initial]);
  if (!open) return null;
  const available = categories.filter((c) => c.kind === form.kind);
  function change(e) {
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
      ...(e.target.name === "kind" ? { category_id: "" } : {}),
    }));
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await onSave({
        ...form,
        amount: Number(form.amount),
        category_id: Number(form.category_id),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save transaction");
    }
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">TRANSACTION</span>
            <h2>{initial ? "Edit transaction" : "Add transaction"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>
        <label>
          What was it for?
          <input
            name="title"
            value={form.title}
            onChange={change}
            placeholder="e.g. Lunch with friends"
            required
            maxLength="160"
          />
        </label>
        <div className="form-grid">
          <label>
            Amount (₹)
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={change}
              placeholder="0.00"
              required
            />
          </label>
          <label>
            Date
            <input
              name="transaction_date"
              type="date"
              value={form.transaction_date}
              onChange={change}
              required
            />
          </label>
        </div>
        <label>
          Type
          <select name="kind" value={form.kind} onChange={change}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>
          Category
          <select
            name="category_id"
            value={form.category_id}
            onChange={change}
            required
          >
            <option value="">Choose a category</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Note <span className="optional">(optional)</span>
          <textarea
            name="note"
            value={form.note || ""}
            onChange={change}
            placeholder="Add a little detail..."
            rows="2"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            {initial ? "Save changes" : "Add transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
