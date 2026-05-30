import { useEffect, useState } from "react"
import {
PieChart,
Pie,
Cell,
Tooltip,
BarChart,
Bar,
LineChart,
Line,
AreaChart,
Area,
XAxis,
YAxis,
CartesianGrid,
ResponsiveContainer
} from "recharts"

const PIE_COLORS = ["#ff4d4d","#ff9f43","#00e676"]

function Alerts(){

const [anomaly,setAnomaly]=useState({cpu:0,ram:0,status:"Normal"})
const [threats,setThreats]=useState([])
const [risk,setRisk]=useState(0)
const [history,setHistory]=useState([])
const [load,setLoad]=useState([])
const [notification,setNotification]=useState("")

useEffect(()=>{

loadData()

const interval=setInterval(()=>{
loadData()
},2000)

return()=>clearInterval(interval)

},[])

function loadData(){

fetch("http://127.0.0.1:8000/anomaly")
.then(res=>res.json())
.then(data=>{

setAnomaly(data || {cpu:0,ram:0,status:"Normal"})

const score=(data.cpu*0.6)+(data.ram*0.4)
const riskScore=Math.round(score)

setRisk(riskScore)

setHistory(prev=>[
...prev.slice(-10),
{
time:new Date().toLocaleTimeString(),
cpu:data.cpu,
ram:data.ram
}
])

setLoad(prev=>[
...prev.slice(-10),
{
time:new Date().toLocaleTimeString(),
load:(data.cpu+data.ram)/2
}
])

})

fetch("http://127.0.0.1:8000/process-threats")
.then(res=>res.json())
.then(data=>{
if(Array.isArray(data)){
setThreats(data)
}else{
setThreats([])
}
})
.catch(()=>setThreats([]))

}

const killProcess = async (pid) => {

const confirmKill = window.confirm("Do you want to kill this process?")
if(!confirmKill) return

const response = await fetch(`http://127.0.0.1:8000/kill-process/${pid}`,{
method:"POST"
})

const data = await response.json()

setNotification(data.status || data.message)

setTimeout(()=>{
setNotification("")
},3000)

}

function getColor(value){

if(value>85) return "#ff4d4d"
if(value>60) return "#ff9f43"
return "#00e676"

}

const severityData=[
{name:"Critical",value: anomaly.cpu>85?60:20},
{name:"Warning",value: anomaly.cpu>60?30:20},
{name:"Normal",value: anomaly.cpu<=60?50:20}
]

const safeThreats = Array.isArray(threats) ? threats : []

const threatDistribution=[
{name:"High",value: safeThreats.filter(t=>t.cpu>80).length},
{name:"Medium",value: safeThreats.filter(t=>t.cpu>50).length},
{name:"Low",value: safeThreats.filter(t=>t.cpu<=50).length}
]

return(

<div className="page-container">

{notification && (
<div style={{
position:"fixed",
top:"20px",
right:"20px",
background:"#00c3ff",
color:"white",
padding:"10px 18px",
borderRadius:"8px",
boxShadow:"0 5px 20px rgba(0,0,0,0.3)",
zIndex:9999
}}>
{notification}
</div>
)}

<h1
style={{
textAlign:"center",
fontSize:"50px",
fontWeight:"600",
marginBottom:"70px",
color:"white"
}}
>
Alert Intelligence Center
</h1>

<div className="alerts-grid">

<div className="alert-card" style={{background:getColor(anomaly.cpu)}}>
<h3>CPU Usage</h3>
<p>{anomaly.cpu}%</p>
</div>

<div className="alert-card" style={{background:getColor(anomaly.ram)}}>
<h3>RAM Usage</h3>
<p>{anomaly.ram}%</p>
</div>

<div className="alert-card status">
<h3>System Status</h3>
<p>{anomaly.status}</p>
</div>

<div className="alert-card" style={{background:getColor(risk)}}>
<h3>AI Risk Score</h3>
<p>{risk}</p>
</div>

</div>

<div className="alerts-analytics">

<div className="chart-box">

<h3>Alert Severity Distribution</h3>

<ResponsiveContainer width="100%" height={260}>

<PieChart>

<Pie
data={severityData}
dataKey="value"
outerRadius={90}
label
>

{severityData.map((entry,index)=>(
<Cell key={index} fill={PIE_COLORS[index]} />
))}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

<div className="chart-box">

<h3>Threat Process Activity</h3>

<ResponsiveContainer width="100%" height={260}>

<BarChart data={safeThreats}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="cpu" fill="#ff4d4d"/>

<Bar dataKey="memory" fill="#00e676"/>

</BarChart>

</ResponsiveContainer>

</div>

</div>

<div className="alerts-analytics">

<div className="chart-box">

<h3>CPU vs RAM Live Trend</h3>

<ResponsiveContainer width="100%" height={260}>

<LineChart data={history}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="time"/>

<YAxis/>

<Tooltip/>

<Line type="monotone" dataKey="cpu" stroke="#ff4d4d" strokeWidth={3}/>

<Line type="monotone" dataKey="ram" stroke="#00e676" strokeWidth={3}/>

</LineChart>

</ResponsiveContainer>

</div>

<div className="chart-box">

<h3>System Load Monitor</h3>

<ResponsiveContainer width="100%" height={260}>

<AreaChart data={load}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="time"/>

<YAxis/>

<Tooltip/>

<Area
type="monotone"
dataKey="load"
stroke="#00c3ff"
fill="#00c3ff"
fillOpacity={0.4}
/>

</AreaChart>

</ResponsiveContainer>

</div>

</div>

<div className="chart-box">

<h3>Threat Level Distribution</h3>

<ResponsiveContainer width="100%" height={260}>

<PieChart>

<Pie
data={threatDistribution}
dataKey="value"
outerRadius={100}
label
>

<Cell fill="#ff4d4d"/>
<Cell fill="#ff9f43"/>
<Cell fill="#00e676"/>

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

<div className="threat-table">

<h2>⚠ Process Threat Monitor</h2>

<table>

<thead>
<tr>
<th>Process</th>
<th>CPU %</th>
<th>Memory %</th>
<th>Threat Level</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{safeThreats.map((p,i)=>{

let level="Low"
let color="green"

if((p.cpu||0)>80 || (p.memory||0)>80){
level="High"
color="red"
}
else if((p.cpu||0)>50){
level="Medium"
color="orange"
}

return(

<tr key={i} style={{color:color}}>

<td>{p.name}</td>
<td>{p.cpu}</td>
<td>{p.memory}</td>
<td>{level}</td>

<td>
<button
onClick={()=>killProcess(p.pid)}
style={{
background:"#ff4d4d",
border:"none",
color:"white",
padding:"6px 10px",
borderRadius:"4px",
cursor:"pointer"
}}
>
Kill
</button>
</td>

</tr>

)

})}

</tbody>

</table>

</div>

</div>

)

}

export default Alerts