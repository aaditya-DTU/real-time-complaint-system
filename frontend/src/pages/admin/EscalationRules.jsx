import { useEffect, useState } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";

export default function EscalationRules() {
  const [rules, setRules] = useState([]);

  const fetchRules = async () => {
    const res = await axios.get("/admin/escalation-rules");
    setRules(res.data);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const updateRule = async (category, updates) => {
    try {
      await axios.put("/admin/escalation-rules", {
        category,
        ...updates,
      });
      toast.success("Rule updated");
      fetchRules();
    } catch {
      toast.error("Failed to update rule");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Escalation Rules
      </h1>

      <div className="space-y-4 max-w-xl">
        {rules.map((rule) => (
          <div
            key={rule.category}
            className="flex justify-between items-center bg-slate-800 p-4 rounded"
          >
            <span className="font-medium">
              {rule.category}
            </span>

            <select
              value={rule.escalateTo}
              onChange={(e) =>
                updateRule(rule.category, {
                  escalateTo: e.target.value,
                })
              }
              className="bg-slate-700 px-2 py-1 rounded"
            >
              <option value="HOD">HOD</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(e) =>
                updateRule(rule.category, {
                  enabled: e.target.checked,
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
