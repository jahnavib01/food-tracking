Open Visual Studio Code.

Clone or download the project folder to your local system.

Open the project folder in VS Code.

Make sure you have the following installed:

Java JDK (version 8 or above)

Apache Maven (if using Spring Boot)

MySQL Server (for database)

Node.js (if frontend uses React)

VS Code Extensions for Java

Database Setup:

Open MySQL Workbench or command line.

Create a database (example: food_tracker).

Import the provided SQL file if available or manually create tables.

Update the database connection details in the configuration file:
For Spring Boot: src/main/resources/application.properties
For JSP/Servlet: dbconfig.java or database.properties

Backend Setup:

If the project is using Spring Boot:
Open terminal and run the command:
mvn spring-boot:run
OR
Run the main class file (the one with @SpringBootApplication).

If the project is using Servlets:
Configure Apache Tomcat server in VS Code.
Deploy the project to Tomcat.
Start the server.

Frontend Setup:

If frontend is built with React:
Open a new terminal in VS Code.
Navigate to frontend folder.
Run the commands:
pnpm install
pnpm run dev

If frontend uses JSP:
Access the application directly from Tomcat using:
http://localhost:8080/FoodExpiryTracker

Application Usage:

Register or log in to your account.

Add new food items with their expiry dates.

View all items and check which are nearing expiry.

Update or delete food items when needed.
