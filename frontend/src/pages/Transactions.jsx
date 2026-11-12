import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import api from "../services/api";
import TransactionModal from "../components/TransactionModal";
const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(n || 0),
  );
export default function Transactions() {
  const [items, setItems] = useState([]),
    [categories, setCategories] = useState([]),
    [modal, setModal] = useState(false),
    [editing, setEditing] = useState(null),
    [query, setQuery] = useState(""),
    [kind, setKind] = useState("all"),
    [error, setError] = useState("");
  async function load() {
    try {
      const [t, c] = await Promise.all([
        api.get("/api/transactions"),
        api.get("/api/categories"),
      ]);
      setItems(t.data);
      setCategories(c.data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.detail || "Could not load transactions.");
    }
  }
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(
    () =>
      items.filter(
        (t) =>
          (kind === "all" || t.kind === kind) &&
          `${t.title} ${t.category.name} ${t.note || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [items, kind, query],
  );
  async function save(payload) {
    if (editing) await api.put(`/api/transactions/${editing.id}`, payload);
    else await api.post("/api/transactions", payload);
    setEditing(null);
    await load();
  }
  async function remove(id) {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      await load();
    } catch (e) {
      setError("Could not delete transaction.");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR MONEY ACTIVITY</span>
          <h1>Transactions</h1>
          <p>Every little detail, all in one place.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setModal(true);
          }}
        >
          <Plus size={17} /> Add transaction
        </button>
      </div>
      {error && <div className="alert-error">{error}</div>}
      <section className="panel table-panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions..."
            />
          </div>
          <select
            className="filter-select"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>
        {filtered.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>TRANSACTION</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="table-title">
                        <span className={`mini-kind ${t.kind}`}>
                          {t.kind === "income" ? (
                            <ArrowDownRight size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </span>
                        <div>
                          <b>{t.title}</b>
                          {t.note && <small>{t.note}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{t.category.name}</span>
                    </td>
                    <td>
                      {new Date(
                        t.transaction_date + "T00:00:00",
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <b
                        className={
                          t.kind === "income"
                            ? "amount-income"
                            : "amount-expense"
                        }
                      >
                        {t.kind === "income" ? "+" : "−"}
                        {money(t.amount)}
                      </b>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title="Edit"
                          onClick={() => {
                            setEditing(t);
                            setModal(true);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button title="Delete" onClick={() => remove(t.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No matching transactions. Try another search or add a transaction.
          </div>
        )}
      </section>
      <TransactionModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditing(null);
        }}
        onSave={save}
        categories={categories}
        initial={editing}
      />
    </>
  );
}
