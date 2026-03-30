import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export function Reports() {
  const barData = [
    { name: 'Projector', value: 30, fill: '#8884d8' },
    { name: 'Chair', value: 20, fill: '#ffc658' },
    { name: 'Whiteboard', value: 28, fill: '#82ca9d' },
  ];

  const pieData = [
    { name: 'Mouse', value: 400 },
    { name: 'Mouse mat', value: 300 },
    { name: 'CPU', value: 300 },
    { name: 'Keyboard', value: 200 },
    { name: 'Chairs', value: 278 },
    { name: 'Monitor', value: 189 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

  const history = [
    { id: 1, faculty: "Dr. Smith", classroom: "Regular Class", resource: "Smart Board", date: "1/02/26", status: "Approved" },
    { id: 2, faculty: "Dr. Lee", classroom: "Computer Lab", resource: "Keyboard", date: "5/02/26", status: "Pending" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-handwriting mb-6 text-center border-b-2 border-black pb-2 inline-block w-full">Utilization Reports</h2>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Total Requests", value: 150, icon: "📋", bg: "bg-yellow-100" },
          { title: "Approved Requests", value: 120, icon: "✔", bg: "bg-lime-100" },
          { title: "Pending Requests", value: 30, icon: "🕒", bg: "bg-orange-100" },
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bg} p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center`}>
            <h3 className="font-bold text-xl font-handwriting mb-2">{kpi.title}</h3>
            <div className="flex items-center gap-4 text-4xl font-bold">
              <span>{kpi.icon}</span>
              <span>{kpi.value}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
          <div className="flex justify-between mb-4 border-b-2 border-black pb-2">
            <h3 className="font-bold text-lg font-handwriting">Resource Utilization</h3>
            <button className="text-xs border border-black px-2 bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Last 30 Days ▼</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
          <div className="flex justify-between mb-4 border-b-2 border-black pb-2">
             <h3 className="font-bold text-lg font-handwriting">Resource Usage Breakdown</h3>
          </div>
          <div className="h-64 flex">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                  stroke="#000"
                  strokeWidth={1}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center text-xs gap-1">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-black" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{entry.name}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed History */}
      <section>
        <h3 className="text-2xl font-handwriting mb-4">Detailed History</h3>
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-black font-handwriting text-xl">
                <th className="p-3 border-r-2 border-black">Faculty</th>
                <th className="p-3 border-r-2 border-black">Classroom Type</th>
                <th className="p-3 border-r-2 border-black">Resource</th>
                <th className="p-3 border-r-2 border-black">Date</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b-2 border-black last:border-b-0 hover:bg-gray-50 h-14">
                  <td className="p-3 border-r-2 border-black font-bold">{item.faculty}</td>
                  <td className="p-3 border-r-2 border-black">{item.classroom}</td>
                  <td className="p-3 border-r-2 border-black">{item.resource}</td>
                  <td className="p-3 border-r-2 border-black font-mono">{item.date}</td>
                  <td className="p-3 text-center">
                    <span className={`
                      px-3 py-1 border-2 border-black rounded-full font-bold text-sm
                      ${item.status === 'Approved' ? 'bg-lime-300' : 'bg-yellow-300'}
                    `}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
               {/* Empty rows filler */}
               {[...Array(3)].map((_, i) => (
                <tr key={`empty-${i}`} className="border-b-2 border-black last:border-b-0 h-14">
                  <td className="border-r-2 border-black"></td>
                  <td className="border-r-2 border-black"></td>
                  <td className="border-r-2 border-black"></td>
                  <td className="border-r-2 border-black"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
