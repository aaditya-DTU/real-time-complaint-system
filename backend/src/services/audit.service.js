import AuditLog from "../models/AuditLog.model.js";

export const logAudit = async ({
  entityType,
  entityId,
  action,
  performedBy,
  metadata = {}
}) => {
  await AuditLog.create({
    entityType,
    entityId,
    action,
    performedBy,
    metadata
  });
};
