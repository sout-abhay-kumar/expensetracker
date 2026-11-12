import { useEffect, useState } from "react";
import { Plus, Wallet, Target } from "lucide-react";
import api from "../services/api";
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
export default function Budgets() {
  const now = new Date(),
    [budgets, setBudgets] = useState([]),
    [categories, setCategories] = useState([]),
    [spent, setSpent] = useState({}),
    [amount, setAmount] = useState(""),
    [category, setCategory] = useState(""),
    [error, setError] = useState("");
  async function load() {
    try {
      const [b, c, t] = await Promise.all([
        api.get("/api/budgets", {
          params: { month: now.getMonth() + 1, year: now.getFullYear() },
        }),
        api.get("/api/categories"),
        api.get("/api/transactions", {
          params: { month: now.getMonth() + 1, year: now.getFullYear() },
        }),
      ]);
      setBudgets(b.data);
      setCategories(c.data.filter((x) => x.kind === "expense"));
      const totals = {};
      t.data
        .filter((x) => x.kind === "expense")
        .forEach(
          (x) =>
            (totals[x.category_id] =
              (totals[x.category_id] || 0) + Number(x.amount)),
        );
      setSpent(totals);
      if (!category && c.data.length)
        setCategory(String(c.data.find((x) => x.kind === "expense")?.id || ""));
    } catch (e) {
      setError(e.response?.data?.detail || "Could not load budgets.");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/budgets", {
        category_id: Number(category),
        amount: Number(amount),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setAmount("");
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || "Could not save budget.");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SPEND WITH INTENTION</span>
          <h1>Your budgets</h1>
          <p>Give your money a little direction this month.</p>
        </div>
      </div>
      {error && <div className="alert-error">{error}</div>}
      <div className="budget-layout">
        <section className="panel budget-create">
          <div className="panel-head">
            <div>
              <span className="eyebrow">SET A LIMIT</span>
              <h3>Create a category budget</h3>
            </div>
            <Target className="muted-icon" />
          </div>
          <form onSubmit={save}>
            <label>
              Expense category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Monthly limit (₹)
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 3000"
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              <Plus size={17} /> Save budget
            </button>
          </form>
          <p className="form-hint">
            Setting the same category again updates its monthly limit.
          </p>
        </section>
        <section className="panel budget-list">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                {now
                  .toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                  .toUpperCase()}
              </span>
              <h3>Budget progress</h3>
            </div>
            <Wallet className="muted-icon" />
          </div>
          {budgets.length ? (
            budgets.map((b) => {
              const used = spent[b.category_id] || 0,
                pct = Math.min(100, (used / Number(b.amount)) * 100);
              return (
                <div className="budget-item" key={b.id}>
                  <div className="budget-item-head">
                    <b>{b.category.name}</b>
                    <span>
                      {money(used)} <small>of {money(b.amount)}</small>
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${pct >= 100 ? "over" : pct >= 80 ? "warning" : ""}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="budget-item-foot">
                    <span>{pct.toFixed(0)}% used</span>
                    <span>
                      {money(Math.max(0, Number(b.amount) - used))} left
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              No budgets yet. Create your first category budget to start
              tracking progress.
            </div>
          )}
        </section>
      </div>
    </>
  );
}
