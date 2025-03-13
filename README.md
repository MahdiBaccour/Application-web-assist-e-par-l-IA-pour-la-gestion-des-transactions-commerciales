# Retail Management Application

## Project Overview

The **goal of this project** is to develop a web application tailored for retailers, enabling them to efficiently record and manage all credit and debit transactions for both their customers and suppliers. This solution aims to replace traditional methods (paper, spreadsheets) with an intuitive, fast, and reliable platform.

## Key Features

### 1. Customer and Supplier Management

- **Profile Creation & Management**: Add and manage customer and supplier profiles.
- **Transaction History**: View a complete transaction history for each contact.

### 2. Transaction Recording

- **Add Credit & Debit Transactions**: Record financial operations with customizable fields (amount, date, description).
- **Balance Tracking**: Monitor real-time balances for each customer or supplier.

### 3. Dashboard & Reports

- **Data Visualization**: Analyze credit and debit trends using interactive charts.
- **Exportable Reports**: Generate detailed reports for in-depth analysis.
- **Alerts**: Receive notifications for overdue payments or critical balances.

### 4. Security & Accessibility

- **Secure Authentication**: Protect data with a secure login system.
- **Multi-User Access**: Manage access with specific roles (owner, employee).

### 5. Dashboard for Better Visualization

- **Interactive Charts**: View trends in credits and debits.
- **Performance Indicators**: Track key performance indicators (KPIs) in real-time.
- **Recent Transactions Table**: Access the latest recorded transactions.

## Technologies Used

- **Frontend**:
  - [Next.js](https://nextjs.org/) - A React framework for server-side rendering and static site generation.
  - [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
  - [Recharts](https://recharts.org/) - A charting library for React.
  - [React Icons](https://react-icons.github.io/react-icons/) - A library of icons for React.
- **Vector Illustrations**:
  - [unDraw](https://undraw.co/) - Open-source illustrations for UI design.

## Project Structure

```
retail-management-app/
├── components/               # Reusable components
│   ├── DashboardCharts.jsx   # Charts for credit & debit trends
│   ├── PerformanceIndicators.jsx # Key performance indicators
│   ├── TransactionTable.jsx  # Recent transactions table
│   ├── UserManagement.jsx    # Customer & supplier management
│   ├── TransactionForm.jsx   # Transaction recording form
├── app/                      # Next.js pages
│   ├── page.tsx              # index page
│   ├── layout.jsx            # layout page
│   ├── not-found.jsx         # Custom 404 page
│   ├──Dashboard/
│       ├──page.jsx           # Dashboard  page
│   ├──Login/
│       ├──page.jsx           # Login  page
├── public/                   # Static assets
│   ├── images/               # Vector illustrations
├── styles/                   # Global styles
│   ├── globals.css           # Tailwind CSS imports
├── README.md                 # Project documentation
```

## Screenshots

### Dashboard

![Dashboard oage](image.png)

### Login Page



### 404 Page



## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/retail-management-app.git
   cd retail-management-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Environment Variables

No environment variables are required for this project.

## Usage

1. **Dashboard**:

   - View interactive charts and performance indicators.
   - Check the recent transactions table.

2. **Customer & Supplier Management**:

   - Add and manage customer and supplier profiles.
   - View transaction history for each contact.

3. **Transaction Recording**:

   - Record credit and debit transactions with custom details.
   - Monitor real-time balances.

4. **Authentication**:

   - Securely log in to access the application.

5. **404 Page**:

   - Get redirected to a custom 404 page if accessing a non-existent route.

## Contribution

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push the branch (`git push origin feature/YourFeatureName`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [unDraw](https://undraw.co/) for vector illustrations.
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework.
- [Recharts](https://recharts.org/) for the charting library.

---

Made with ❤️ by [Mohamed Ali Hachicha & Mahdi Baccour](https://github.com/your-username)

