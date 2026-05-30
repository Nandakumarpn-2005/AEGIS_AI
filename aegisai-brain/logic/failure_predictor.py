class FailurePredictor:

    # 🔥 Prediction thresholds
    CPU_THRESHOLD = 95
    MEMORY_THRESHOLD = 90
    DISK_THRESHOLD = 95
    PROCESS_COUNT_THRESHOLD = 300

    def calculate_risk(self, cpu, memory, disk, process_count):

        score = 0

        if cpu >= self.CPU_THRESHOLD:
            score += 1

        if memory >= self.MEMORY_THRESHOLD:
            score += 1

        if disk >= self.DISK_THRESHOLD:
            score += 1

        if process_count >= self.PROCESS_COUNT_THRESHOLD:
            score += 1

        if score >= 2:
            return "HIGH"
        elif score == 1:
            return "MEDIUM"
        else:
            return "LOW"