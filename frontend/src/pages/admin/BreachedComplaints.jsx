import { useEffect, useState } from "react";
import { getEscalatedComplaints } from "../../api/admin.api.js";
import ComplaintCard from "../../components/complaint/ComplaintCard.jsx";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

export default function EscalatedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ fetch escalated (breached) complaints
  const fetchEscalated = async () => {
    const data = await getEscalatedComplaints();
    setComplaints(data);
  };

  // ✅ fetch staff list (for reassign)
  const fetchStaff = async () => {
    const res = await api.get("/admin/staff");
    setStaffList(res.data);
  };

  useEffect(() => {
    const init = async () => {
      await fetchEscalated();
      await fetchStaff();
      setLoading(false);
    };
    init();
  }, []);

  // ✅ resolve escalated complaint
  const handleResolve = async (complaintId) => {
    await api.patch(`/admin/complaints/${complaintId}/escalated`, {
      action: "RESOLVE",
    });
    toast.success("Complaint resolved");
    fetchEscalated();
  };

  // ✅ reassign escalated complaint
  const handleReassign = async (complaintId, staffId) => {
    if (!staffId) return;

    await api.patch(`/admin/complaints/${complaintId}/escalated`, {
      action: "REASSIGN",
      staffId,
    });

    toast.success("Complaint reassigned");
    fetchEscalated();
  };

  if (loading) {
    return <p className="text-slate-400">Loading...</p>;
  }

  if (complaints.length === 0) {
    return (
      <p className="text-slate-400">No escalated (breached) complaints 🎉</p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Escalated / Breached Complaints</h1>

      {complaints.map((c) => (
        <div key={c._id} className="bg-slate-800 p-4 rounded space-y-3">
          {/* ✅ FIX: pass the full complaint object, not individual flat props */}
          <ComplaintCard
            complaint={c}
            showAssignee={true}
          />

          {/* 🔴 ADMIN ACTIONS */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => handleResolve(c._id)}
              className="bg-green-600 px-3 py-1 rounded text-sm"
            >
              Resolve
            </button>

            <select
              defaultValue=""
              onChange={(e) => handleReassign(c._id, e.target.value)}
              className="bg-slate-700 px-2 py-1 rounded text-sm"
            >
              <option value="" disabled>
                Reassign staff
              </option>

              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}