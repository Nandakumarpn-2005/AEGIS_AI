import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"

export default function GlobalNotification({
  cpu,
  ram,
  disk,
  systemStatus,
  customMessage
}) {
  const [alerts, setAlerts] = useState([])
  const [open, setOpen] = useState(false)

  const lastAlertsRef = useRef({})
  const containerRef = useRef(null)

  useEffect(() => {
    const newAlerts = []

    if (cpu > 80) {
      newAlerts.push({
        id: "cpu",
        message: `High CPU Usage: ${cpu}%`
      })
    }

    if (ram > 85) {
      newAlerts.push({
        id: "ram",
        message: `High RAM Usage: ${ram}%`
      })
    }

    if (disk > 75) {
      newAlerts.push({
        id: "disk",
        message: `Disk usage warning: ${disk}%`
      })
    }

    if (systemStatus === "Critical") {
      newAlerts.push({
        id: "status",
        message: "System Status Critical"
      })
    }

    if (customMessage) {
      newAlerts.push({
        id: "custom",
        message: customMessage
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => {
        const updated = [...prev]

        newAlerts.forEach(alert => {
          if (!lastAlertsRef.current[alert.id]) {
            updated.unshift(alert)
            lastAlertsRef.current[alert.id] = true
          }
        })

        return updated.slice(0, 10)
      })
    }
  }, [cpu, ram, disk, systemStatus, customMessage])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <>
      {/* Bell Icon */}
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: "30px",
          right: "30px",
          zIndex: 1000
        }}
      >
        <div
          onClick={() => setOpen(!open)}
          style={{
            background: "#0f172a",
            padding: "12px",
            borderRadius: "50%",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
            position: "relative"
          }}
        >
          <Bell size={22} color="#ffffff" />

          {alerts.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                background: "#ef4444",
                color: "#fff",
                fontSize: "12px",
                padding: "2px 6px",
                borderRadius: "50%",
                fontWeight: "bold"
              }}
            >
              {alerts.length}
            </span>
          )}
        </div>
      </div>

      {/* Notification Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: "85px",
            right: "30px",
            width: "300px",
            background: "#1e293b",
            borderRadius: "12px",
            padding: "15px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
            zIndex: 999
          }}
        >
          <h4 style={{ marginBottom: "12px" }}>Notifications</h4>

          {alerts.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              No notifications
            </p>
          ) : (
            alerts.map((alert, index) => (
              <div
                key={index}
                style={{
                  background: "#0f172a",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  fontSize: "13px"
                }}
              >
                {alert.message}
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}