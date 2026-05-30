import { useEffect,useState } from "react"

function NetworkChart(){

 const [data,setData]=useState([])

 useEffect(()=>{

  const fetchNetwork = async ()=>{

    const res = await fetch("http://127.0.0.1:8000/network")
    const net = await res.json()

    const point={
      time:new Date().toLocaleTimeString(),
      sent:net.sent/1000000,
      received:net.received/1000000
    }

    setData(prev=>{
      const updated=[...prev,point]
      if(updated.length>20) updated.shift()
      return updated
    })

  }

  fetchNetwork()

  const interval=setInterval(fetchNetwork,2000)

  return ()=>clearInterval(interval)

 },[])

 return <div>Network Chart</div>

}

export default NetworkChart