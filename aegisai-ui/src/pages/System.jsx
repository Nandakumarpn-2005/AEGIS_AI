import { useEffect, useState } from "react"
import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
PieChart,
Pie,
Cell
} from "recharts"

const COLORS = ["#22c55e","#3b82f6","#f59e0b","#ef4444","#a855f7"]

function System(){

const [status,setStatus]=useState({})
const [history,setHistory]=useState([])
const [processes,setProcesses]=useState([])
const [clock,setClock]=useState(new Date())

useEffect(()=>{

load()

const timer=setInterval(load,3000)

const clockTimer=setInterval(()=>{
setClock(new Date())
},1000)

return ()=>{
clearInterval(timer)
clearInterval(clockTimer)
}

},[])

function load(){

fetch("http://127.0.0.1:8000/status")
.then(res=>res.json())
.then(data=>{

setStatus(data)

setHistory(prev=>[
...prev.slice(-20),
{
time:new Date().toLocaleTimeString(),
cpu:data.cpu,
ram:data.ram,
disk:data.disk
}
])

})

fetch("http://127.0.0.1:8000/processes")
.then(res=>res.json())
.then(data=>{
if(Array.isArray(data)){
setProcesses(data)
}
})

}

function getColor(value){
if(value>80) return "#ef4444"
if(value>60) return "#f59e0b"
return "#22c55e"
}

const pieData=[
{name:"CPU",value:status.cpu||0},
{name:"RAM",value:status.ram||0},
{name:"Disk",value:status.disk||0}
]

const processPie=processes.slice(0,6).map(p=>({
name:p.name,
value:p.cpu
}))

const healthScore = 100 - ((status.cpu||0)+(status.ram||0)+(status.disk||0))/3

return(

<div style={{padding:"30px"}}><h1 style={{textAlign:"center"}}>
System Intelligence Center
</h1><p style={{textAlign:"center",marginBottom:"30px"}}>
{clock.toLocaleTimeString()}
</p>{/* CARDS */}

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr 1fr",
gap:"20px",
marginBottom:"30px"
}}><Card title="CPU Usage" value={(status.cpu||0)+"%"} color={getColor(status.cpu)} />
<Card title="RAM Usage" value={(status.ram||0)+"%"} color={getColor(status.ram)} />
<Card title="Disk Usage" value={(status.disk||0)+"%"} color={getColor(status.disk)} />
<Card title="Health Score" value={Math.round(healthScore)+"%"} color="#06b6d4" />

</div>{/* CHART GRID */}

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"25px"
}}><Panel title="CPU Trend"><LineChart data={history}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Line dataKey="cpu" stroke="#22c55e" strokeWidth={3}/>
</LineChart></Panel><Panel title="RAM Trend"><LineChart data={history}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Line dataKey="ram" stroke="#3b82f6" strokeWidth={3}/>
</LineChart></Panel><Panel title="Disk Trend"><LineChart data={history}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="time"/>
<YAxis/>
<Tooltip/>
<Line dataKey="disk" stroke="#f59e0b" strokeWidth={3}/>
</LineChart></Panel><Panel title="Resource Distribution"><PieChart width={350} height={250}>
<Pie data={pieData} dataKey="value" outerRadius={90} label>
{pieData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]}/>
))}
</Pie>
<Tooltip/>
</PieChart></Panel></div>{/* PROCESS SECTION */}

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"25px",
marginTop:"30px"
}}><div style={{
background:"#1e293b",
padding:"20px",
borderRadius:"10px"
}}><h3>Top Processes</h3><p>Total running processes: {processes.length}</p>{processes.slice(0,8).map((p,i)=>(

<div key={i} style={{
background:"#334155",
padding:"10px",
borderRadius:"6px",
marginBottom:"8px"
}}>
<strong>{p.name}</strong>
<br/>
CPU: {p.cpu}% | Runtime: {p.runtime}
</div>
))}</div><div style={{
background:"#1e293b",
padding:"20px",
borderRadius:"10px"
}}><h3>Process CPU Distribution</h3><PieChart width={350} height={250}>
<Pie data={processPie} dataKey="value" outerRadius={90} label>
{processPie.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]}/>
))}
</Pie>
<Tooltip/>
</PieChart></div></div></div>)

}

function Card({title,value,color}){
return(

<div style={{
background:"#1e293b",
padding:"20px",
borderRadius:"10px",
textAlign:"center",
boxShadow:`0 0 10px ${color}`
}}>
<h3>{title}</h3>
<div style={{fontSize:"28px",color:color,fontWeight:"bold"}}>
{value}
</div>
</div>
)
}function Panel({title,children}){
return(

<div style={{
background:"#1e293b",
padding:"20px",
borderRadius:"10px"
}}>
<h3 style={{marginBottom:"15px"}}>{title}</h3>
<ResponsiveContainer width="100%" height={250}>
{children}
</ResponsiveContainer>
</div>
)
}export default System