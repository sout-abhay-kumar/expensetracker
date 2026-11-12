import { useEffect, useState } from "react";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../services/api";
import TransactionModal from "../components/TransactionModal";
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
const palette = [
  "#557b68",
  "#9db7a5",
  "#d7a66d",
  "#8b9bb4",
  "#b9a4c8",
  "#d68d83",
  "#8a9b9a",
];
export default function Dashboard() {
  const [data, setData] = useState(null),
    [categories, setCategories] = useState([]),
    [modal, setModal] = useState(false),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  async function load() {
    setBusy(true);
    try {
      const [d, c] = await Promise.all([
        api.get("/api/dashboard"),
        api.get("/api/categories"),
      ]);
      setData(d.data);
      setCategories(c.data);
      setError("");
    } catch (e) {
      setError(
        e.response?.data?.detail ||
          "Could not load your dashboard. Check that the API and database are running.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(payload) {
    await api.post("/api/transactions", payload);
    await load();
  }
  const stats = data
    ? [
        {
          label: "Total income",
          value: money(data.income),
          icon: ArrowDownRight,
          cls: "green",
          hint: "Money received",
        },
        {
          label: "Total expenses",
          value: money(data.expenses),
          icon: ArrowUpRight,
          cls: "rose",
          hint: "Money spent this month",
        },
        {
          label: "Available balance",
          value: money(data.balance),
          icon: Wallet,
          cls: "sage",
          hint: "Income minus expenses",
        },
        {
          label: "Monthly budgets",
          value: money(data.budget_total),
          icon: TrendingUp,
          cls: "amber",
          hint: "Combined spending limits",
        },
      ]
    : [];
  if (busy && !data)
    return <div className="loading-block">Getting your money picture...</div>;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR MONEY, AT A GLANCE</span>
          <h1>
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
                ? "afternoon"
                : "evening"}
            .
          </h1>
          <p>Here's how things are looking this month.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={17} /> Add transaction
        </button>
      </div>
      {error && <div className="alert-error">{error}</div>}
      {data && (
        <>
          <div className="stats-grid">
            {stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-top">
                  <span>{s.label}</span>
                  <span className={`stat-icon ${s.cls}`}>
                    <s.icon size={18} />
                  </span>
                </div>
                <strong>{s.value}</strong>
                <small>{s.hint}</small>
              </div>
            ))}
          </div>
          <div className="content-grid">
            <section className="panel spending-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">SPENDING SNAPSHOT</span>
                  <h3>Where it goes</h3>
                </div>
                <Link to="/transactions" className="text-link">
                  All transactions <ArrowRight size={15} />
                </Link>
              </div>
              {data.category_totals.length ? (
                <>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height="220">
                      <PieChart>
                        <Pie
                          data={data.category_totals}
                          dataKey="amount"
                          nameKey="category"
                          innerRadius={65}
                          outerRadius={92}
                          paddingAngle={3}
                        >
                          {data.category_totals.map((x, i) => (
                            <Cell
                              key={x.category}
                              fill={palette[i % palette.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => money(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="category-legend">
                      {data.category_totals.slice(0, 6).map((x, i) => (
                        <div key={x.category}>
                          <span>
                            <i
                              style={{
                                background: palette[i % palette.length],
                              }}
                            />
                            {x.category}
                          </span>
                          <b>{money(x.amount)}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-chart">
                  <div className="empty-icon">
                    <Wallet />
                  </div>
                  <b>Your spending story starts here</b>
                  <span>Add an expense to see your category breakdown.</span>
                </div>
              )}
            </section>
            <section className="panel insights-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">A LITTLE PERSPECTIVE</span>
                  <h3>Smart insights</h3>
                </div>
                <span className="insight-spark">
                  <Sparkles size={18} />
                </span>
              </div>
              <p className="panel-subtitle">
                Small observations to help you make informed choices.
              </p>
              <div className="insight-list">
                {data.insights.map((x, i) => (
                  <div className="insight-item" key={i}>
                    <span className="insight-dot">{i + 1}</span>
                    <p>{x}</p>
                  </div>
                ))}
              </div>
              <div className="insight-foot">
                Insights are based on the transactions and budgets you record.
              </div>
            </section>
          </div>
          <section className="panel recent-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">THE LATEST</span>
                <h3>Recent transactions</h3>
              </div>
              <Link to="/transactions" className="text-link">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            {data.recent_transactions.length ? (
              <div className="transaction-list">
                {data.recent_transactions.map((t) => (
                  <div className="transaction-row" key={t.id}>
                    <div className="transaction-symbol">
                      {t.kind === "income" ? (
                        <ArrowDownRight />
                      ) : (
                        <ArrowUpRight />
                      )}
                    </div>
                    <div className="transaction-main">
                      <b>{t.title}</b>
                      <span>
                        {t.category.name} ·{" "}
                        {new Date(
                          t.transaction_date + "T00:00:00",
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <strong
                      className={
                        t.kind === "income" ? "amount-income" : "amount-expense"
                      }
                    >
                      {t.kind === "income" ? "+" : "−"}
                      {money(t.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No transactions yet. Add your first income or expense to get
                started.
              </div>
            )}
          </section>
        </>
      )}
      <TransactionModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={save}
        categories={categories}
      />
    </>
  );
}
