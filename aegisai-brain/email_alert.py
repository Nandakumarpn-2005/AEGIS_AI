import smtplib
from email.mime.text import MIMEText

SENDER_EMAIL = "snavaneeth974@gmail.com"
APP_PASSWORD = "mcbjkhagspmgfalx"

def send_email_alert(subject, message, receiver):

    try:
        msg = MIMEText(message)
        msg["Subject"] = subject
        msg["From"] = SENDER_EMAIL
        msg["To"] = receiver

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()

        server.login(SENDER_EMAIL, APP_PASSWORD)

        server.sendmail(SENDER_EMAIL, receiver, msg.as_string())

        server.quit()

        print("Email sent successfully")

    except Exception as e:
        print("Email error:", e)