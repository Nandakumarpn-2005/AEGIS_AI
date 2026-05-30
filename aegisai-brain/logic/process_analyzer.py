class ProcessAnalyzer:

    MIN_PROCESS_CPU = 1
    MIN_PROCESS_MEMORY = 1

    SAFE_SYSTEM_PROCESSES = [
        "system",
        "idle",
        "svchost.exe",
        "explorer.exe",
        "wininit.exe",
        "csrss.exe"
    ]

    def get_high_resource_processes(self, process_list):

        # Sort by CPU descending
        sorted_processes = sorted(
            process_list,
            key=lambda x: x["process_cpu_usage"],
            reverse=True
        )

        candidates = []

        for proc in sorted_processes:

            name = str(proc["process_name"]).lower()
            pid = proc["process_id"]
            cpu = proc["process_cpu_usage"]
            memory = proc["process_memory_usage"]

            if name in self.SAFE_SYSTEM_PROCESSES:
                continue

            if cpu > self.MIN_PROCESS_CPU or memory > self.MIN_PROCESS_MEMORY:
                candidates.append((pid, name, cpu, memory))

        return candidates