import { useEffect, useState } from "react";
import {
  getAllComplaints,
  assignComplaint,
  getStaffList,
} from "../../api/admin.api";
import ComplaintCard from "../../components/complaint/ComplaintCard";
import toast from "react-hot-toast";
import { COMPLAINT_STATUS, COMPLAINT_TYPES } from "../../utils/constants";

export default function AllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchComplaints = async () => {
    try {
      const data = await getAllComplaints();
      setComplaints(data);
    } catch (err) {
      toast.error("Failed to fetch complaints");
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await getStaffList();
      setStaffList(data);
    } catch {
      toast.error("Failed to load staff");
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchComplaints(), fetchStaff()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleAssign = async (complaintId, staffId) => {
    try {
      await assignComplaint(complaintId, staffId);
      toast.success("Complaint assigned");
      fetchComplaints();
    } catch {
      toast.error("Assignment failed");
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;

    if (typeFilter !== "ALL" && c.type !== typeFilter) return false;

    return true;
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">All Complaints</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          className="bg-slate-700 px-4 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          {Object.values(COMPLAINT_STATUS).map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          className="bg-slate-700 px-4 py-2 rounded"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {Object.values(COMPLAINT_TYPES).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* States */}
      {loading && <p className="text-slate-400">Loading complaints...</p>}

      {!loading && filteredComplaints.length === 0 && (
        <p className="text-slate-400">No complaints found.</p>
      )}

      {/* Complaint List */}
      <div className="space-y-4 max-w-3xl">
        {filteredComplaints.map((complaint) => (
          <div key={complaint._id} className="bg-slate-800 p-4 rounded">
            <ComplaintCard
              complaint={complaint}
              onAssign={
                !complaint.assignedTo
                  ? (c) => {
                      const staffId = prompt(
                        "Enter staff ID to assign:", // replace with your modal/select
                      );
                      if (staffId) handleAssign(c._id, staffId);
                    }
                  : undefined
              }
            />

            {/* Assign Staff */}
            {!complaint.assignedTo && (
              <select
                defaultValue=""
                onChange={(e) => handleAssign(complaint._id, e.target.value)}
                className="mt-3 bg-slate-700 px-2 py-1 rounded text-sm"
              >
                <option value="" disabled>
                  Assign staff
                </option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
