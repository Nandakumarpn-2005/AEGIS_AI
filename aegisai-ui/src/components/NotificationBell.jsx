import { useEffect, useState, useRef } from "react"

function NotificationBell() {

  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const bellRef = useRef(null)

  useEffect(() => {

    const fetchAlerts = async () => {
      try {

        const response = await fetch("http://127.0.0.1:8000/status")

        if (!response.ok) return

        const data = await response.json()

        const newAlerts = []

        if (data.cpu > 80)
          newAlerts.push("High CPU usage detected")

        if (data.memory > 80)
          newAlerts.push("High RAM usage detected")

        if (data.disk > 85)
          newAlerts.push("Disk almost full")

        if (data.anomaly)
          newAlerts.push("AI anomaly detected")

        if (data.decision === "RESTART_SERVICE")
          newAlerts.push("Service restart triggered")

        if (data.decision === "KILL_PROCESS")
          newAlerts.push("High CPU process terminated")

        setAlerts(newAlerts)

      } catch (error) {
        console.error("Notification fetch error:", error)
      }
    }

    fetchAlerts()

    const interval = setInterval(fetchAlerts,2000)

    return () => clearInterval(interval)

  }, [])

  useEffect(() => {

    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])

  return (
    <div
      ref={bellRef}
      style={{
        position: "fixed",
        top: "25px",
        right: "25px",
        zIndex: 9999
      }}
    >

      <div
        className="notification-bell"
        onClick={() => setOpen(!open)}
        style={{
          fontSize: "22px",
          cursor: "pointer",
          position: "relative"
        }}
      >
        🔔

        {alerts.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            {alerts.length}
          </span>
        )}

      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "0",
            width: "280px",
            background: "#1e293b",
            borderRadius: "10px",
            padding: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: 10000,
            color: "white"
          }}
        >

          <h4 style={{ marginBottom: "12px" }}>Alerts</h4>

          {alerts.length === 0 ? (
            <div style={{ color: "#94a3b8" }}>
              No active alerts
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div
                key={index}
                style={{
                  background: "#334155",
                  padding: "8px",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  fontSize: "13px"
                }}
              >
                {alert}
              </div>
            ))
          )}

        </div>
      )}

    </div>
  )
}

export default NotificationBell