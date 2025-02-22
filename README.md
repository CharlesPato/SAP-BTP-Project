# CharlesBookShop

CharlesBookShop is a SAP UI5-based bookstore application that allows users to browse, rate, and review books. It includes an interactive UI with a star rating system and supports double-click navigation to detailed book pages. The backend is powered by Node.js with PostgreSQL as the database, and the entire application is containerized using Docker.

## Table of Contents
- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
  - [Web App Setup](#web-app-setup)
  - [Server Setup](#server-setup)
  - [Database Setup (PostgreSQL)](#database-setup-postgresql)
  - [Docker Setup](#docker-setup)
  - [SAP CAP Libraries](#sap-cap-libraries)
- [Usage](#usage)
- [Testing URLs](#testing-urls)
- [Application Details](#application-details)
- [License](#license)

---

## Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide

### Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).

### Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.

## Project Overview
This project features:
- A **SAP UI5-based frontend** for book browsing, rating, and navigation.
- A **Node.js backend** that handles API requests.
- **PostgreSQL database** for storing book details, user ratings, and reviews.
- **Docker support** for containerized deployment.
- **SAP Cloud Application Programming (CAP) Model** for enhanced backend capabilities.

## Technologies Used
- **Frontend**: SAP UI5, JavaScript
- **Backend**: Node.js, Express.js, SAP CAP
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose

## Installation

### Web App Setup
1. Navigate to the frontend directory:
   ```sh
   cd CharlesBookShop/webapp
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the web app:
   ```sh
   npm start
   ```
   This will start the SAP UI5 application on a local development server.

### Server Setup
1. Navigate to the server directory:
   ```sh
   cd CharlesBookShop/server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```
   The server will run on the configured port (default: 3000).

### Database Setup (PostgreSQL)
1. Ensure PostgreSQL is installed on your system.
2. Create a new database:
   ```sh
   createdb charlesbookshop
   ```
3. Apply migrations (if applicable):
   ```sh
   npm run migrate
   ```

### Docker Setup
1. Navigate to the project root directory:
   ```sh
   cd CharlesBookShop
   ```
2. Build and start the Docker containers:
   ```sh
   docker-compose up --build
   ```
   This will launch the frontend, backend, and database in separate containers.
3. To stop the containers:
   ```sh
   docker-compose down
   ```

### SAP CAP Libraries
This project includes several SAP Cloud Application Programming Model (CAP) libraries:
- **@sap/cds**: Core Data Services framework for SAP CAP.
- **@sap/cds-dk**: Development kit for SAP CAP.
- **@sap/cds-mtx**: Multitenancy extensions for SAP CAP.
- **@sap/cds-pg**: PostgreSQL adapter for SAP CAP.
- **@sap/xssec**: Security utilities for authentication and authorization.
- **@sap/xsenv**: Environment variable utilities for SAP BTP services.
- **@sap/hana-client**: Database driver for SAP HANA integration (if applicable).

To install these libraries:
```sh
npm install @sap/cds @sap/cds-dk @sap/cds-mtx @sap/cds-pg @sap/xssec @sap/xsenv @sap/hana-client
```

## Usage
- Open the web app in your browser.
- Browse books, rate them, and view detailed information.
- API endpoints are available for interacting with book data.

## Testing URLs
- **Frontend (SAP UI5 app)**: `http://localhost:4004/sap-btp/webapp/index.html`
- **Backend API Endpoints**:
  - Ratings: `http://localhost:4004/odata/v4/catalog/Ratings`
  - Books: `http://localhost:4004/odata/v4/catalog/Books`
  - Authors: `http://localhost:4004/odata/v4/catalog/Authors`
- **PostgreSQL Connection**: `postgres://user:password@localhost:5432/charlesbookshop`
- **Docker Containers**: Run `docker ps` to check running services.

## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Fri Feb 21 2025 00:07:05 GMT+0200 (South Africa Standard Time)|
|**App Generator**<br>@sap/generator-fiori-freestyle|
|**App Generator Version**<br>1.16.4|
|**Generation Platform**<br>Visual Studio Code|
|**Template Used**<br>simple|
|**Service Type**<br>Local Cap|
|**Service URL**<br>http://localhost:4004/odata/v4/catalog/|
|**Module Name**<br>sap-btp|
|**Application Title**<br>SAP BTP Project|
|**Namespace**<br>|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.133.0|
|**Enable Code Assist Libraries**<br>False|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>False|

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  In order to launch the generated app, simply start your CAP project and navigate to the following location in your browser:

http://localhost:4004/sap-btp/webapp/index.html

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)

## License
This project is licensed under the MIT License.

