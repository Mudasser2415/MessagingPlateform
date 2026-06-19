# Message Platform API - Setup & Instructions

## 🏗 Architecture Overview
This project is built using **Clean Architecture** patterns with **.NET 10** and **Entity Framework Core (Code First)**.

The solution is divided into four main projects:
1. **Domain**: Contains the core Entities (`Client`, `Template`, `Group`, `GroupMember`, `Message`). No external dependencies.
2. **Application**: Contains the core business logic, CQRS (`MediatR`), Validations (`FluentValidation`), and Data Transfer Objects (`DTO`s mapped via `AutoMapper`).
3. **Infrastructure**: Contains the data access implementation, DbContext configuration, and EF Core fluent API maps.
4. **API**: The presentation layer. RESTful controllers that expose endpoints to the external world, configured with Swagger UI for easy testing.

## 📋 Prerequisites
Before running the project, ensure you have the following installed:
- [.NET 10 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
- SQL Server (LocalDB is sufficient for development, it operates by default if you don't override the connection string)
- Entity Framework Core CLI tools (`dotnet tool install --global dotnet-ef`)

## 🚀 Setup and Execution

### 1. Build the Solution
Open a terminal in the root directory and restore/build the projects:
```powershell
cd src
dotnet build
```

### 2. Database Migrations
Entity Framework Core Code-First approach is used. The migrations are stored within the `API` and linked to `Infrastructure`.
To apply the latest migrations to your local SQL Server Database, run:
```powershell
cd API
dotnet ef database update -p ../Infrastructure/Infrastructure.csproj -s API.csproj
```
*Note: If no connection string is provided in `appsettings.json`, it defaults to LocalDb: `Server=(localdb)\mssqllocaldb;Database=MessagingPlatform;Trusted_Connection=True;MultipleActiveResultSets=true`*

### 3. Run the Application
Start the API server:
```powershell
cd API
dotnet run
```
The server will start, typically on port `5008` (check the console output for the exact port).

### 4. Test the Endpoints using Swagger
Once the app is running, open a browser and navigate to the Swagger UI:
👉 **[http://localhost:5008/swagger](http://localhost:5008/swagger)**

From there, you can interact with all the available modules:
- `/api/Clients`
- `/api/Templates`
- `/api/Groups`
- `/api/GroupMembers`
- `/api/Messages`

## 🛠 Adding New Migrations
When you modify or add new entities in the `Domain` project, follow these steps to update the database:

1. Update `ApplicationDbContext` and add `Configuration` in `Infrastructure`.
2. Generate the migration:
   ```powershell
   cd API
   dotnet ef migrations add <YourMigrationName> -p ../Infrastructure/Infrastructure.csproj -s API.csproj
   ```
3. Update the database:
   ```powershell
   dotnet ef database update -p ../Infrastructure/Infrastructure.csproj -s API.csproj
   ```
