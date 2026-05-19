import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  getMyComplaints,
  getAssignedComplaints,
  getComplaintById,
  searchComplaints,
  getBreachedComplaints,
  getEscalatedComplaints,
  getMyComplaintSummary,
  getStaffComplaintSummary,
} from "../api/complaint.api";
import { getAllComplaints, getAdminDashboard } from "../api/admin.api";
import { onComplaintUpdated, onComplaintEscalated, onDashboardRefresh } from "../utils/socket";

// ── Reducer ────────────────────────────────────────────────

const initialState = {
  data:     [],
  total:    0,
  page:     1,
  loading:  false,
  error:    null,
  summary:  null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "SUCCESS":
      return {
        ...state,
        loading:  false,
        data:     action.payload.data     ?? action.payload,
        total:    action.payload.total    ?? state.total,
        page:     action.payload.page     ?? state.page,
      };
    case "SUMMARY":
      return { ...state, summary: action.payload };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_ONE": {
      const updated = action.payload;
      return {
        ...state,
        data: state.data.map((c) =>
          c._id === updated._id ? { ...c, ...updated } : c
        ),
      };
    }
    case "PREPEND":
      return { ...state, data: [action.payload, ...state.data] };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// ── Hook: My Complaints (Student) ──────────────────────────

export const useMyComplaints = (filters = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const filtersKey = JSON.stringify(filters);

  const fetch = useCallback(async (params = {}) => {
    dispatch({ type: "LOADING" });
    try {
      const data = await getMyComplaints({ ...filters, ...params });
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  }, [filtersKey]);

  // Real-time updates
  useEffect(() => {
    const unsub = onComplaintUpdated((updated) => {
      dispatch({ type: "UPDATE_ONE", payload: updated });
    });
    return unsub;
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
};

// ── Hook: Assigned Complaints (Staff) ─────────────────────

export const useAssignedComplaints = (filters = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const filtersKey = JSON.stringify(filters);

  const fetch = useCallback(async (params = {}) => {
    dispatch({ type: "LOADING" });
    try {
      const data = await getAssignedComplaints({ ...filters, ...params });
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  }, [filtersKey]);

  useEffect(() => {
    const unsub1 = onComplaintUpdated((c)    => dispatch({ type: "UPDATE_ONE", payload: c }));
    const unsub2 = onComplaintEscalated((c)  => dispatch({ type: "UPDATE_ONE", payload: c }));
    return () => { unsub1(); unsub2(); };
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
};

// ── Hook: All Complaints (Admin) ───────────────────────────

export const useAllComplaints = (filters = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const filtersKey = JSON.stringify(filters);

  const fetch = useCallback(async (params = {}) => {
    dispatch({ type: "LOADING" });
    try {
      const data = await getAllComplaints({ ...filters, ...params });
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  }, [filtersKey]);

  useEffect(() => {
    const unsub1 = onComplaintUpdated((c)   => dispatch({ type: "UPDATE_ONE", payload: c }));
    const unsub2 = onDashboardRefresh(()    => fetch());
    return () => { unsub1(); unsub2(); };
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
};

// ── Hook: Single Complaint ─────────────────────────────────

export const useComplaint = (id) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetch = useCallback(async () => {
    if (!id) return;
    dispatch({ type: "LOADING" });
    try {
      const data = await getComplaintById(id);
      dispatch({ type: "SUCCESS", payload: { data: [data.complaint ?? data] } });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  }, [id]);

  // Live update for this specific complaint
  useEffect(() => {
    const unsub = onComplaintUpdated((updated) => {
      if (updated._id === id) dispatch({ type: "UPDATE_ONE", payload: updated });
    });
    return unsub;
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const complaint = state.data?.[0] ?? null;
  return { complaint, loading: state.loading, error: state.error, refetch: fetch };
};

// ── Hook: Complaint Summary ────────────────────────────────

export const useComplaintSummary = (role = "student") => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetch = useCallback(async () => {
    dispatch({ type: "LOADING" });
    try {
      const fn =
        role === "admin"   ? getAdminDashboard :
        role === "staff"   ? getStaffComplaintSummary :
                             getMyComplaintSummary;
      const data = await fn();
      dispatch({ type: "SUMMARY", payload: data });
      dispatch({ type: "SUCCESS", payload: { data: [] } });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  }, [role]);

  useEffect(() => {
    const unsub = onDashboardRefresh(() => fetch());
    return unsub;
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary: state.summary, loading: state.loading, error: state.error, refetch: fetch };
};

// ── Hook: Breached Complaints ──────────────────────────────

export const useBreachedComplaints = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetch = useCallback(async () => {
    dispatch({ type: "LOADING" });
    try {
      const data = await getBreachedComplaints();
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
};

// ── Hook: Search / Filter ──────────────────────────────────

export const useComplaintSearch = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef(null);

  const search = useCallback(async (params = {}) => {
    dispatch({ type: "LOADING" });
    try {
      const data = await searchComplaints(params);
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      if (err.name !== "AbortError") {
        dispatch({ type: "ERROR", payload: err.message });
      }
    }
  }, []);

  return { ...state, search };
};

export default useMyComplaints;