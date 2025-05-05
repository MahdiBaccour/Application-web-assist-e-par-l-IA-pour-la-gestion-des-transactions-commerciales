"use client";
import { useEffect, useState } from "react";
import { getUsers, updateUserStatus } from "@/services/users/userService";
import { ImSpinner2 } from "react-icons/im";
import { FaUserPlus, FaUsers, FaUserCheck, FaUserTimes } from "react-icons/fa";
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserCard from "./UserCard";
import UserForm from "./UserForm";

export default function UserTable() {
  const { data: session } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNewUser, setIsAddingNewUser] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  useEffect(() => {
    if (session?.user.role !== "owner") {
      router.push("/home/forbidden");
    }
  }, [session, router]);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers("", session?.user.accessToken);
        if (data.success) {
          setUsers(data.users);
          setError(null);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("Erreur lors du chargement des utilisateurs.");
        console.error(error);
      }
      setLoading(false);
    };
    loadUsers();
  }, [session?.user.accessToken]);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "vérifié" ? "non vérifié" : "vérifié";
    const result = await showConfirmationDialog(session.user.theme, {
      title: `Changer le statut en ${newStatus} ?`,
      text: "Vous pourrez le modifier plus tard.",
      confirmText: `Oui, définir comme ${newStatus}`,
    });

    if (result.isConfirmed) {
      setUpdatingId(id);
      try {
        const success = await updateUserStatus(id, newStatus, session.user.accessToken);
        if (success) {
          setUsers((prev) =>
            prev.map((user) =>
              user.id === id ? { ...user, verified_status: newStatus } : user
            )
          );
          showSuccessAlert(session.user.theme, `Statut mis à jour en ${newStatus}`);
        } else {
          showErrorAlert(session.user.theme, "Échec de la mise à jour du statut");
        }
      } catch (error) {
        showErrorAlert(session.user.theme, "Échec de la mise à jour du statut");
      }
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filterStatus === "all") return true;
    return user.verified_status === filterStatus;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="alert alert-error shadow-lg mb-4">
        <div>
          <span>{error}</span>
        </div>
      </div>
    );

  return (
    <div className="overflow-x-auto">
      {/* Add User or Show Filters */}
      {isAddingNewUser ? (
        <div className="my-6">
          <UserForm
            onActionSuccess={(newUser) => {
              setUsers((prev) => [...prev, newUser]);
              setIsAddingNewUser(false);
            }}
            onGoBack={() => setIsAddingNewUser(false)}
          />
        </div>
      ) : (
        <>
          {/* Filter Buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setIsAddingNewUser(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaUserPlus /> Ajouter un utilisateur
            </button>

            <button
              onClick={() => setFilterStatus("all")}
              className={`btn flex items-center gap-2 ${filterStatus === "all" ? "btn-info" : "btn-outline"}`}
            >
              <FaUsers /> Tous
            </button>

            <button
              onClick={() => setFilterStatus("vérifié")}
              className={`btn flex items-center gap-2 ${filterStatus === "vérifié" ? "btn-success" : "btn-outline"}`}
            >
              <FaUserCheck /> Vérifiés
            </button>

            <button
              onClick={() => setFilterStatus("non vérifié")}
              className={`btn flex items-center gap-2 ${filterStatus === "non vérifié" ? "btn-error" : "btn-outline"}`}
            >
              <FaUserTimes /> Non vérifiés
            </button>
          </div>

          {/* Table */}
          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Nom d'utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut vérification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.verified_status}</td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.verified_status)}
                        className={`btn btn-xs ${
                          user.verified_status === "vérifié" ? "btn-error" : "btn-success"
                        }`}
                        disabled={updatingId === user.id}
                      >
                        {updatingId === user.id ? (
                          <ImSpinner2 className="animate-spin" />
                        ) : user.verified_status === "vérifié" ? (
                          "Marquer non vérifié"
                        ) : (
                          "Marquer vérifié"
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    Aucun utilisateur disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 flex-wrap gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              Premier
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              Précédent
            </button>
            <span className="text-center self-center">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm"
            >
              Suivant
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="btn btn-sm"
            >
              Dernier
            </button>
          </div>
        </>
      )}
    </div>
  );
}
