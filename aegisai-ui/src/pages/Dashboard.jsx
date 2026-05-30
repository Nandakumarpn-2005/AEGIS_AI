import { useEffect, useState } from "react"
import {
LineChart,
Line,
AreaChart,
Area,
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer
} from "recharts"

function Dashboard(){

const [history,setHistory] = useState([])
const [metrics,setMetrics] = useState({})
const [processes,setProcesses] = useState([])

useEffect(()=>{

async function load(){

try{

const status = await fetch("http://127.0.0.1:8000/status")
const statusData = await status.json()

const histReq = await fetch("http://127.0.0.1:8000/history")
const histData = await histReq.json()

const procReq = await fetch("http://127.0.0.1:8000/processes")
const procData = await procReq.json()

setMetrics(statusData)
setHistory(histData)
setProcesses(procData)

}catch(err){
console.log("API Error:",err)
}

}

load()

const interval = setInterval(load,2000)

return ()=>clearInterval(interval)

},[])

function cardColor(value){
if(value < 50) return "linear-gradient(135deg,#10b981,#059669)"
if(value < 80) return "linear-gradient(135deg,#f59e0b,#d97706)"
return "linear-gradient(135deg,#ef4444,#dc2626)"
}

const activityHistory = history.map(h=>({
time:h.time,
activity:(h.cpu + h.ram + h.disk)/3
}))

const runtimeRanking = [...processes].sort((a,b)=>b.runtime-a.runtime)
const memoryRanking = [...processes].sort((a,b)=>b.memory-a.memory)

return(

<div className="dashboard-container">

<h1
  style={{
    textAlign: "center",
    fontSize: "50px",
    fontWeight: "600",
    marginBottom: "70px",
    color: "white"
  }}
>
  System Monitoring Dashboard
</h1>


{/* METRIC CARDS */}

<div className="metrics-grid">

<Metric title="CPU Usage" value={metrics.cpu} color={cardColor(metrics.cpu)} />
<Metric title="RAM Usage" value={metrics.ram} color={cardColor(metrics.ram)} />
<Metric title="Disk Usage" value={metrics.disk} color={cardColor(metrics.disk)} />
<Metric title="Network MB/s" value={metrics.net} color="linear-gradient(135deg,#3b82f6,#2563eb)" />
<Metric title="Disk IO MB/s" value={metrics.disk_io} color="linear-gradient(135deg,#8b5cf6,#7c3aed)" />

</div>

{/* CHART GRID */}

<div className="chart-grid">

<Chart title="CPU Trend">
<AreaChart data={history}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Area dataKey="cpu" stroke="#22c55e" fill="#22c55e33"/>
</AreaChart>
</Chart>

<Chart title="RAM Trend">
<AreaChart data={history}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Area dataKey="ram" stroke="#f59e0b" fill="#f59e0b33"/>
</AreaChart>
</Chart>

<Chart title="Disk Usage Trend">
<LineChart data={history}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Line dataKey="disk" stroke="#ef4444" strokeWidth={3}/>
</LineChart>
</Chart>

<Chart title="Network Throughput">
<LineChart data={history}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Line dataKey="net" stroke="#3b82f6" strokeWidth={3}/>
</LineChart>
</Chart>

<Chart title="Disk Activity">
<LineChart data={history}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Line dataKey="disk_io" stroke="#a855f7" strokeWidth={3}/>
</LineChart>
</Chart>

<Chart title="System Load Overview">
<LineChart data={history}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Line dataKey="cpu" stroke="#22c55e"/>
<Line dataKey="ram" stroke="#f59e0b"/>
<Line dataKey="disk" stroke="#ef4444"/>
</LineChart>
</Chart>

<Chart title="Top Process CPU Usage">
<BarChart data={processes}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="cpu" fill="#22c55e"/>
</BarChart>
</Chart>

<Chart title="Top Process Memory">
<BarChart data={memoryRanking}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="memory" fill="#3b82f6"/>
</BarChart>
</Chart>

<Chart title="Longest Running Processes">
<BarChart data={runtimeRanking}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="runtime" fill="#f59e0b"/>
</BarChart>
</Chart>

<Chart title="System Activity Score">
<LineChart data={activityHistory}>
<CartesianGrid stroke="#334155"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Line dataKey="activity" stroke="#10b981" strokeWidth={3}/>
</LineChart>
</Chart>

</div>

<h2 className="process-title">Top Processes</h2>

<table className="process-table">

<thead>
<tr>
<th>Process</th>
<th>CPU %</th>
<th>Memory %</th>
<th>Runtime</th>
</tr>
</thead>

<tbody>

{processes.map((p,i)=>(
<tr key={i}>
<td>{p.name}</td>
<td>{p.cpu}</td>
<td>{p.memory}</td>
<td>{p.runtime}</td>
</tr>
))}

</tbody>

</table>

</div>
)
}

function Metric({title,value,color}){

return(
<div className="metric-card" style={{background:color}}>
<h3>{title}</h3>
<h2>{value ? value.toFixed(1) : 0}</h2>
</div>
)
}

function Chart({title,children}){

return(
<div className="chart-card">
<h3>{title}</h3>
<ResponsiveContainer width="100%" height={250}>
{children}
</ResponsiveContainer>
</div>
)
}

export default Dashboard