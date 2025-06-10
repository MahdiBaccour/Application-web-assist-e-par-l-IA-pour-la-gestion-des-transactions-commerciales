"use client";
import { useEffect, useState } from "react";
import { getUsers, updateUserStatus } from "@/services/users/userService";
import { ImSpinner2 } from "react-icons/im";
import { 
  FaUserPlus, 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaSearch,
  FaUserTag,
  FaTimes
} from "react-icons/fa";
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserForm from "./UserForm";


const roleMap = {
  owner: "Propriétaire",
  employee: "Employé",
  client: "Client",
  supplier: "Fournisseur",
  user: "Utilisateur"
};

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, filterRole]);

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
    // Status filter
    const statusMatch = filterStatus === "all" || user.verified_status === filterStatus;
    
    // Role filter
    const roleMatch = filterRole === "all" || user.role === filterRole;
    
    // Search filter (username or email)
    const searchMatch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && roleMatch && searchMatch;
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
          {/* Filter Section - Improved layout */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Top Row: Action Buttons */}
            <div className="flex gap-2 flex-wrap">
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

            {/* Bottom Row: Compact search and role filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search Input - Improved alignment */}
              <div className="relative flex-1 min-w-[250px] max-w-[400px]">
                <div className="join w-full">
                  <div className="join-item bg-base-300 px-4 flex items-center">
                    <FaSearch />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    className="input input-bordered join-item w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      className="join-item btn btn-ghost"
                      onClick={() => setSearchTerm("")}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              {/* Role Select - Improved alignment */}
              <div className="min-w-[200px] max-w-[300px]">
                <div className="join w-full">
                  <div className="join-item bg-base-300 px-4 flex items-center">
                    <FaUserTag />
                  </div>
                  <select
                    className="select select-bordered join-item w-full"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="owner">Propriétaire</option>
                    <option value="employee">Employé</option>
                    <option value="client">Client</option>
                    <option value="supplier">Fournisseur</option>
                  </select>
                </div>
              </div>
            </div>
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
                    {/* Map role to French display name */}
                    <td>{roleMap[user.role] || user.role}</td>
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
          {totalPages > 1 && (
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
          )}
        </>
      )}
    </div>
  );
}