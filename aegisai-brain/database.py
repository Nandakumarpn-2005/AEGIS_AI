import sqlite3

DB = "metrics.db"

def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS metrics(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TEXT,
        cpu REAL,
        ram REAL,
        disk REAL,
        net REAL,
        disk_io REAL
    )
    """)

    conn.commit()
    conn.close()


def insert_metrics(data):
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute(
        "INSERT INTO metrics(time,cpu,ram,disk,net,disk_io) VALUES (?,?,?,?,?,?)",
        (
            data["time"],
            data["cpu"],
            data["ram"],
            data["disk"],
            data["net"],
            data["disk_io"]
        )
    )

    conn.commit()
    conn.close()


def get_history():
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    rows = c.execute(
        "SELECT time,cpu,ram,disk,net,disk_io FROM metrics ORDER BY id DESC LIMIT 120"
    ).fetchall()

    conn.close()

    rows.reverse()

    return [
        {
            "time": r[0],
            "cpu": r[1],
            "ram": r[2],
            "disk": r[3],
            "net": r[4],
            "disk_io": r[5]
        }
        for r in rows
    ]