"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import { createClient } from "@/services/clients/clients";  // Import the createClient function

export default function ClientForm({ onActionSuccess }) {
  const [client, setClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [adding, setAdding] = useState(false);

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      // Use the createClient function from the services file to add the client
      const newClient = await createClient(client); 

      if (!newClient) throw new Error("Failed to add client");

      Swal.fire("Success", "Client added successfully!", "success");
      onActionSuccess();  // Notify the parent component about the success
    } catch (error) {
      Swal.fire("Error", "Failed to add client", "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">Add New Client</h2>
      <input
        type="text"
        name="name"
        value={client.name}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Name"
      />
      <input
        type="email"
        name="email"
        value={client.email}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Email"
      />
      <input
        type="text"
        name="phone"
        value={client.phone}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Phone"
      />
      <input
        type="text"
        name="address"
        value={client.address}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Address"
      />
      <button type="submit" className="btn btn-primary w-full" disabled={adding}>
        {adding ? "Adding..." : "Add Client"}
      </button>
    </form>
  );
}
