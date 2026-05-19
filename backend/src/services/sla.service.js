import { SLA_RULES } from "../utils/constants.js";

export const calculateSlaDeadline = (type) => {
  const hours = SLA_RULES[type];

  if (hours === undefined) {
    throw new Error("Invalid complaint type");
  }

  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);

  return deadline;
};
