1.Open Visual Studio Code.

2.Clone or download the project folder to your local system.

3.Open the project folder in VS Code.

4.Make sure you have the following installed:

   i.Java JDK (version 8 or above)

   ii.Apache Maven (if using Spring Boot)

   iii.MySQL Server (for database)

   iv.Node.js (if frontend uses React)

   v.VS Code Extensions for Java

5.Database Setup:

  i.Open MySQL Workbench or command line.

  ii.Create a database (example: food_tracker).

  iii.Import the provided SQL file if available or manually create tables.

  iv.Update the database connection details in the configuration file:
     For Spring Boot: src/main/resources/application.properties
     For JSP/Servlet: dbconfig.java or database.properties

6.Backend Setup:

  i.If the project is using Spring Boot:
    Open terminal and run the command:
    mvn spring-boot:run
    OR Run the main class file (the one with @SpringBootApplication).

  ii.If the project is using Servlets:
    Configure Apache Tomcat server in VS Code.
    Deploy the project to Tomcat.
    Start the server.

7.Frontend Setup:

   i.If frontend is built with React:
     Open a new terminal in VS Code.
     Navigate to frontend folder.
     Run the commands:
       pnpm install
       pnpm run dev

   ii.If frontend uses JSP:
      Access the application directly from Tomcat using:
      http://localhost:8080/FoodExpiryTracker

8.Application Usage:

   i.Register or log in to your account.

   ii.Add new food items with their expiry dates.

   iii.View all items and check which are nearing expiry.

   iv.Update or delete food items when needed.
