// components/TransactionTable.jsx
'use client'

const transactions = [
  { id: 1, date: '2023-10-01', description: 'Product A Purchase', amount: 1200, status: 'Paid' },
  { id: 2, date: '2023-10-02', description: 'Product B Purchase', amount: 800, status: 'Pending' },
  { id: 3, date: '2023-10-03', description: 'Product C Purchase', amount: 1500, status: 'Overdue' },
  { id: 4, date: '2023-10-04', description: 'Product D Purchase', amount: 600, status: 'Paid' },
  { id: 5, date: '2023-10-05', description: 'Product E Purchase', amount: 2000, status: 'Pending' },
];

export default function TransactionsTable() {
  return (
    <div className="card bg-base-100 shadow-xl mt-8">
      <div className="card-body">
        <h2 className="card-title">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* Table Head */}
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount ($)</th>
                <th>Status</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td>${transaction.amount}</td>
                  <td>
                    <span
                      className={`badge ${
                        transaction.status === 'Paid'
                          ? 'badge-success'
                          : transaction.status === 'Pending'
                          ? 'badge-info'
                          : 'badge-error'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}