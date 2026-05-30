import psutil
import subprocess


class Actions:

    SAFE_PROCESSES = [
        "explorer.exe",
        "svchost.exe",
        "system",
        "idle",
        "wininit.exe",
        "csrss.exe",
        "memcompression"
    ]

    def alert(self):
        print("⚠ ALERT: System requires attention")

    def kill_process_tree(self, pid):

        try:
            parent = psutil.Process(pid)
            name = parent.name().lower()

            if name in self.SAFE_PROCESSES:
                print(f"⚠ Skipping protected process: {name}")
                return False

            for child in parent.children(recursive=True):
                try:
                    child.kill()
                except:
                    pass

            parent.kill()

            print(f"❌ Killed process: {name} (PID: {pid})")
            return True

        except psutil.NoSuchProcess:
            return False

        except psutil.AccessDenied:
            print("⚠ Run as Administrator")
            return False

        except Exception as e:
            print("Kill error:", e)
            return False

    def restart_service(self, service_name):

        try:
            subprocess.run(["sc", "stop", service_name], capture_output=True)
            subprocess.run(["sc", "start", service_name], capture_output=True)

            print(f"🔁 Restarted service: {service_name}")
            return True

        except Exception as e:
            print("Restart error:", e)
            return False