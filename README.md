🖼️ Images:

![WhatsApp Image 2025-05-04 at 18 41 12_9fd4b42b](https://github.com/user-attachments/assets/3fc78044-893c-4707-a036-505b6de706c0)
![WhatsApp Image 2025-05-04 at 18 41 13_db754970](https://github.com/user-attachments/assets/f81983aa-7db6-41ef-a720-c3d656fc8215)

🌐 Deployment:

https://airqualitymonitor1.netlify.app/

🖥️ Software:

🔄 Real-Time Data: The system continuously updates and displays data from the MQ-6, MQ-135, and DHT11 sensors, showing key metrics such as gas levels, air quality index (AQI), temperature, and humidity.

💻 Dynamic Dashboard: Built with React and styled using TailwindCSS, the dashboard provides a clean, responsive, and modern user interface for viewing real-time sensor data.

📲 Alert System: Integrated with Twilio, the system sends SMS alerts to registered users whenever certain threshold values (such as high levels of harmful gases or poor air quality) are reached.

☁️ Cloud Data Logging: Using ThinkSpeak API, the system logs sensor data in the cloud for further analysis and tracking over time.

⚙️ Hardware:

💡 ESP32 Microcontroller: The brain of the system, collecting sensor data and transmitting it to the frontend application for real-time monitoring.

🌬️ MQ-6 Sensor: Measures the concentration of gases like methane, carbon monoxide, and alcohol to detect harmful gases in the environment.

🌫️ MQ-135 Sensor: Used to monitor air quality, detecting gases such as ammonia, nitrogen, alcohol, benzene, smoke, and CO2.

🌡️ DHT11 Sensor: Measures temperature and humidity levels to provide additional environmental data for analysis.
