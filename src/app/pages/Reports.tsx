import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getUtilizationReport } from "../lib/api";
import { ReportFilters, UtilizationReport } from "../lib/types";

const COLORS = ["#d8fb77", "#facc15", "#86efac", "#fca5a5", "#93c5fd"];

const initialFilters: ReportFilters = {
  startDate: "",
  endDate: "",
  resourceName: "",
  location: "",
};

const emptyReport: UtilizationReport = {
  totals: {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
  },
  byResource: [],
  byLocation: [],
  rows: [],
  availableResources: [],
  locations: [],
};

export function Reports() {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [report, setReport] = useState<UtilizationReport>(emptyReport);

  async function loadReport(nextFilters = filters) {
    const nextReport = await getUtilizationReport(nextFilters);
    setReport(nextReport);
  }

  useEffect(() => {
    loadReport(initialFilters);
  }, []);

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-[2rem] leading-none font-handwriting">Utilization Reports Dashboard</h2>
        <p className="text-sm text-gray-600">
          Filter by date, resource, and location to generate graphical and tabular reports.
        </p>
      </section>

      <section className="rounded-[1.5rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              className="h-12 rounded-[1rem] border-2 border-black px-4"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              className="h-12 rounded-[1rem] border-2 border-black px-4"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="resource-filter">Resource</label>
            <select
              id="resource-filter"
              value={filters.resourceName}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  resourceName: event.target.value,
                }))
              }
              className="h-12 rounded-[1rem] border-2 border-black px-4"
            >
              <option value="">All Resources</option>
              {report.availableResources.map((resourceName) => (
                <option key={resourceName} value={resourceName}>
                  {resourceName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="location-filter">Location</label>
            <select
              id="location-filter"
              value={filters.location}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
              className="h-12 rounded-[1rem] border-2 border-black px-4"
            >
              <option value="">All Locations</option>
              {report.locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => loadReport(filters)}
            className="rounded-[1rem] border-2 border-black bg-[#d8fb77] px-5 py-3 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            Generate Report
          </button>
          <button
            type="button"
            onClick={() => {
              setFilters(initialFilters);
              loadReport(initialFilters);
            }}
            className="rounded-[1rem] border-2 border-black bg-white px-5 py-3 font-bold"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total Requests", value: report.totals.total, color: "bg-yellow-100" },
          { label: "Approved", value: report.totals.approved, color: "bg-lime-100" },
          { label: "Pending", value: report.totals.pending, color: "bg-orange-100" },
          { label: "Rejected", value: report.totals.rejected, color: "bg-red-100" },
          { label: "Cancelled", value: report.totals.cancelled, color: "bg-gray-100" },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-[1.3rem] border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${card.color}`}
          >
            <div className="text-sm font-bold uppercase tracking-wide text-gray-600">
              {card.label}
            </div>
            <div className="mt-3 text-4xl font-black">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.5rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-4 text-[1.8rem] leading-none font-handwriting">Requests by Resource</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.byResource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#d8fb77" stroke="#000" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[1.5rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-4 text-[1.8rem] leading-none font-handwriting">Requests by Location</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={report.byLocation} dataKey="value" nameKey="name" outerRadius={95} label>
                  {report.byLocation.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="mb-4 text-[1.8rem] leading-none font-handwriting">Tabular Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black font-handwriting text-xl">
                <th className="p-3">Faculty</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Classroom</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row) => (
                <tr key={row.id} className="border-b border-black/10 last:border-b-0">
                  <td className="p-3 font-bold">{row.faculty}</td>
                  <td className="p-3">{row.resourceName}</td>
                  <td className="p-3">{row.classroomType}</td>
                  <td className="p-3">{row.location}</td>
                  <td className="p-3 text-center font-mono">{row.quantity}</td>
                  <td className="p-3 text-center">{row.status}</td>
                  <td className="p-3">{new Date(row.requestedAt).toLocaleString()}</td>
                </tr>
              ))}
              {report.rows.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={7}>
                    No requests match the selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
