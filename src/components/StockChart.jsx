import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StockChart({ data, onClick }) {
  if (!data || data.length === 0) return <p>데이터 없음</p>;

  return (
    <div
      className="h-40 mt-4 cursor-pointer hover:bg-gray-100 transition rounded"
      onClick={onClick}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;