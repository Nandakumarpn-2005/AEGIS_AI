class DecisionEngine:

    def decide(self, anomaly, risk, suspicious=False):

        # 🔥 Highest priority
        if anomaly and risk == "HIGH":
            return "KILL_PROCESS"

        if risk == "HIGH":
            return "KILL_PROCESS"

        if risk == "MEDIUM":
            return "RESTART_SERVICE"

        if suspicious:
            return "ALERT"

        return "NO_ACTION"
     