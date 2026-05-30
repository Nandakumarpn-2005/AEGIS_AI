import { useEffect, useState } from "react"

function Toast({ message }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="toast">
      {message}
    </div>
  )
}

export default Toast