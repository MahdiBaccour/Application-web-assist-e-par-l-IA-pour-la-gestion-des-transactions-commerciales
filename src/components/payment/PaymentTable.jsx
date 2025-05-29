"use client";
import { useEffect, useState } from "react";
import {
  getPayments,
  deletePayment,
  getPaymentsClientOrSupplier,
} from "@/services/payments/paymentService";
import { ImSpinner2 } from "react-icons/im";
import {
  FaPlus,
  FaMoneyCheckAlt,
  FaCreditCard,
  FaRegMoneyBillAlt,
  FaUniversity,
  FaMobileAlt,
  FaFileInvoiceDollar,
  FaSearch,
} from "react-icons/fa";
import PaymentForm from "./PaymentForm";
import PaymentCard from "./PaymentCard";
import UpdatePaymentForm from "./UpdatePaymentForm";
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const paymentMethods = [
  { id: 1, name: "Credit Card", icon: <FaCreditCard /> },
  { id: 2, name: "Cash", icon: <FaRegMoneyBillAlt /> },
  { id: 3, name: "Bank Transfer", icon: <FaUniversity /> },
  { id: 4, name: "Debit Card", icon: <FaCreditCard /> },
  { id: 5, name: "Mobile Payments", icon: <FaMobileAlt /> },
  { id: 6, name: "Checks", icon: <FaFileInvoiceDollar /> },
];

// Export principal interactif
export function PaymentTable({
  refreshTrigger,
  startDate,
  endDate,
  onDataCapture,
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isAddingNewPayment, setIsAddingNewPayment] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(null);
  const [filterMethod, setFilterMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (
      session?.user.role !== "owner" &&
      session?.user.role !== "employee"
    ) {
      router.push("/home/forbidden");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        let response;
        if (session?.user.role === "client") {
          response = await getPaymentsClientOrSupplier(
            startDate || undefined,
            endDate || undefined,
            session.user.id,
            undefined,
            session?.user.accessToken
          );
        } else if (session?.user.role === "supplier") {
          response = await getPaymentsClientOrSupplier(
            startDate || undefined,
            endDate || undefined,
            undefined,
            session.user.id,
            session?.user.accessToken
          );
        } else {
          response = await getPayments(
            startDate || undefined,
            endDate || undefined,
            session?.user.accessToken
          );
        }

        setPayments(response.payments || []);
        onDataCapture?.(response.payments || []);
      } catch (error) {
        showErrorAlert(session?.user?.theme || "light", "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [refreshTrigger, session?.user.accessToken, session?.user.theme]);

  const handleAddNewPayment = () => setIsAddingNewPayment(true);
  const handleEdit = (id) => setSelectedPaymentId(id);
  const handleGoBack = () => {
    setIsAddingNewPayment(false);
    setSelectedPaymentId(null);
  };

  const handlePaymentUpdate = (updated) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelectedPaymentId(null);
  };

  const handleNewPayment = (payment) => {
    if (payment && payment.id) {
      setPayments((prev) => [
        {
          id: payment.id,
          transaction_id: payment.transaction_id,
          amount_paid: payment.amount_paid,
          payment_method_id: payment.payment_method_id,
          payment_date: payment.payment_date || new Date().toISOString(),
        },
        ...prev,
      ]);
      setIsAddingNewPayment(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirmationDialog(session.user.theme, {
      title: "Supprimer le paiement?",
      text: "Cette action ne peut être annulée!",
      confirmText: "Oui, supprimez-le",
    });

    if (result.isConfirmed) {
      setIsLoadingDelete(id);
      try {
        const success = await deletePayment(id, session.user.accessToken);
        if (success) {
          setPayments((prev) => prev.filter((p) => p.id !== id));
          showSuccessAlert(session.user.theme, "Paiement supprimé avec succès");
        } else {
          showErrorAlert(session.user.theme, "Échec de la suppression du paiement");
        }
      } catch (error) {
        showErrorAlert(session.user.theme, "Erreur de suppression");
      } finally {
        setIsLoadingDelete(null);
      }
    }
  };

  // Combined filter function with search - FIXED
  const filteredPayments = payments.filter((p) => {
    // Apply payment method filter
    const methodMatch = filterMethod === "all" || 
      paymentMethods.find((m) => m.name === filterMethod)?.id === p.payment_method_id;
    
    // Apply search term filter - FIXED
    const searchMatch = String(p.reference || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return methodMatch && searchMatch;
  });

  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  return (
    <div className="overflow-x-auto">
      {isAddingNewPayment ? (
        <PaymentForm
          onActionSuccess={handleNewPayment}
          onGoBack={handleGoBack}
          accessToken={session.user.accessToken}
        />
      ) : selectedPaymentId ? (
        <UpdatePaymentForm
          paymentId={selectedPaymentId}
          onUpdateSuccess={handlePaymentUpdate}
          onGoBack={handleGoBack}
          accessToken={session.user.accessToken}
        />
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAddNewPayment}
                className="btn btn-primary flex items-center gap-2"
              >
                <FaPlus /> Ajouter un nouveau paiement
              </button>

              <button
                onClick={() => setFilterMethod("all")}
                className={`btn flex items-center gap-2 ${
                  filterMethod === "all" ? "btn-info" : "btn-outline"
                }`}
              >
                <FaMoneyCheckAlt /> Tous
              </button>

              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setFilterMethod(method.name)}
                  className={`btn flex items-center gap-2 ${
                    filterMethod === method.name ? "btn-success" : "btn-outline"
                  }`}
                >
                  {method.icon} {method.name}
                </button>
              ))}
            </div>
            
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par référence"
                className="input input-bordered pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Réference Transaction</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoadingDelete={isLoadingDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    {searchTerm ? 
                      "Aucun paiement trouvé avec cette référence" : 
                      "Aucun paiement trouvé"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              Première
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm mx-2"
            >
              Précédent
            </button>
            <span className="text-center mx-2">
              Page {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm mx-2"
            >
              Suivant
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="btn btn-sm"
            >
              Dernière
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function SimplePaymentTable({ payments }) {
  if (payments.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 mt-8">
        Aucun paiement trouvé
      </div>
    );
  }

  const getMethodName = (methodId) => {
    return paymentMethods.find((m) => m.id === methodId)?.name || "Inconnu";
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Réference Transaction</th>
            <th>Montant</th>
            <th>Méthode</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.reference}</td>
              <td>{(payment.amount_paid || 0).toFixed(2)} TND</td>
              <td>{getMethodName(payment.payment_method_id)}</td>
              <td>
                {new Date(payment.payment_date).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default PaymentTable;