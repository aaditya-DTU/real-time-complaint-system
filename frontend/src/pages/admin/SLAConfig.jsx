import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import toast from "react-hot-toast";

export default function SLAConfig() {
  const [sla, setSla] = useState([]);

  const fetchSla = async () => {
    const res = await api.get("/admin/sla");
    setSla(res.data);
  };

  useEffect(() => {
    fetchSla();
  }, []);

  const handleUpdate = async (category, hours) => {
    try {
      await api.put("/admin/sla", { category, hours });
      toast.success("SLA updated");
      fetchSla();
    } catch {
      toast.error("Failed to update SLA");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        SLA Configuration
      </h1>

      <div className="space-y-4 max-w-md">
        {sla.map((item) => (
          <div
            key={item.category}
            className="flex justify-between items-center bg-slate-800 p-4 rounded"
          >
            <span className="font-medium">
              {item.category}
            </span>

            <input
              type="number"
              defaultValue={item.hours}
              onBlur={(e) =>
                handleUpdate(
                  item.category,
                  Number(e.target.value)
                )
              }
              className="w-24 bg-slate-700 px-2 py-1 rounded"
            />

            <span className="text-xs text-slate-400">
              hrs
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
