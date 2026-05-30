import { useEffect, useState } from "react"

function ProcessTable(){

  const [processes,setProcesses] = useState([])

  useEffect(()=>{

    const fetchProcesses = async ()=>{

      try{

        const res = await fetch("http://127.0.0.1:8000/processes")
        const data = await res.json()

        setProcesses(data)

      }catch(err){
        console.error(err)
      }

    }

    fetchProcesses()

    const interval = setInterval(fetchProcesses,2000)

    return ()=>clearInterval(interval)

  },[])

  return(

    <div style={card}>

      <h3>Top CPU Processes</h3>

      <table style={table}>

        <thead>
          <tr>
            <th>Process</th>
            <th>CPU %</th>
            <th>Memory %</th>
            <th>Runtime (min)</th>
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

const card={
  background:"#1e293b",
  padding:"20px",
  borderRadius:"12px",
  color:"white"
}

const table={
  width:"100%",
  marginTop:"10px",
  fontSize:"14px"
}

export default ProcessTable