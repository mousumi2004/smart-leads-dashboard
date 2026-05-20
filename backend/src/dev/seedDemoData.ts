import { Types } from "mongoose";
import { FOLLOW_UP_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "../constants/lead.js";
import { Lead } from "../models/Lead.js";
import type { LeadActivityType } from "../models/LeadActivity.js";
import { LeadActivity } from "../models/LeadActivity.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

export const DEMO_CREDENTIALS = {
  admin: { email: "admin@smartleads.test", password: "Password123!" },
  sales: { email: "sales@smartleads.test", password: "Password123!" }
} as const;

const salesUsers = [
  { name: "Riya Sales", email: DEMO_CREDENTIALS.sales.email },
  { name: "Arjun Mehta", email: "arjun.sales@smartleads.test" },
  { name: "Neha Kapoor", email: "neha.sales@smartleads.test" },
  { name: "Kabir Singh", email: "kabir.sales@smartleads.test" }
];

const names = [
  "Aarav Sharma",
  "Ananya Rao",
  "Vivaan Patel",
  "Diya Iyer",
  "Aditya Nair",
  "Meera Shah",
  "Ishaan Gupta",
  "Kavya Menon",
  "Rohan Das",
  "Sara Khan",
  "Neil Fernandes",
  "Priya Verma",
  "Dev Malhotra",
  "Tara Kulkarni",
  "Kunal Joshi",
  "Nisha Bansal",
  "Rahul Reddy",
  "Avni Chatterjee",
  "Sahil Jain",
  "Maya Thomas",
  "Yash Agarwal",
  "Ritika Sinha",
  "Om Prakash",
  "Kiara Dutta",
  "Harsh Saxena",
  "Aisha Mirza",
  "Manav Bhat",
  "Pooja Mishra",
  "Aryan Sen",
  "Sneha Pillai",
  "Vihaan Bose",
  "Rhea Roy",
  "Nikhil Kumar",
  "Tanya Ghosh",
  "Parth Desai",
  "Ira Mukherjee"
];

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10 + Math.abs(days % 7), days % 2 === 0 ? 30 : 0, 0, 0);
  return date;
};

interface DemoActivityInput {
  lead: Types.ObjectId;
  actor: Types.ObjectId;
  type: LeadActivityType;
  message: string;
  note?: string;
  oldValue?: string;
  newValue?: string;
}

export async function seedDemoData() {
  const existingAdmin = await User.findOne({ email: DEMO_CREDENTIALS.admin.email });
  if (existingAdmin) return;

  const password = await hashPassword(DEMO_CREDENTIALS.admin.password);
  const admin = await User.create({
    name: "Mousumi Admin",
    email: DEMO_CREDENTIALS.admin.email,
    password,
    role: "admin"
  });

  const hashedSalesPassword = await hashPassword(DEMO_CREDENTIALS.sales.password);
  const createdSalesUsers = await User.create(
    salesUsers.map((user) => ({
      ...user,
      password: hashedSalesPassword,
      role: "sales"
    }))
  );

  const leads = await Lead.create(
    names.map((name, index) => {
      const status = LEAD_STATUSES[index % LEAD_STATUSES.length];
      const assignedTo = createdSalesUsers[index % createdSalesUsers.length]._id;
      const nextFollowUpAt = index % 5 === 0 ? undefined : addDays((index % 9) - 3);
      return {
        name,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/\.$/, "")}@example.com`,
        status,
        source: LEAD_SOURCES[index % LEAD_SOURCES.length],
        priority: LEAD_PRIORITIES[index % LEAD_PRIORITIES.length],
        createdBy: admin._id,
        assignedTo,
        nextFollowUpAt,
        followUpType: nextFollowUpAt ? FOLLOW_UP_TYPES[index % FOLLOW_UP_TYPES.length] : undefined,
        followUpNote: nextFollowUpAt ? `Follow up about ${index % 2 === 0 ? "pricing" : "demo availability"}.` : undefined,
        lastContactedAt: status === "Contacted" || status === "Qualified" ? addDays(-((index % 6) + 1)) : undefined
      };
    })
  );

  await LeadActivity.create(
    leads.flatMap((lead, index) => {
      const actor = (lead.assignedTo ?? admin._id) as Types.ObjectId;
      const entries: DemoActivityInput[] = [
        {
          lead: lead._id,
          actor: admin._id,
          type: "lead_created",
          message: `Lead created with status ${lead.status}`,
          newValue: lead.status
        },
        {
          lead: lead._id,
          actor: admin._id,
          type: "assigned",
          message: "Lead assigned",
          newValue: lead.assignedTo?.toString()
        }
      ];

      if (lead.status !== "New") {
        entries.push({
          lead: lead._id,
          actor,
          type: "status_changed",
          message: `Status changed from New to ${lead.status}`,
          note: index % 2 === 0 ? "Customer interaction completed during demo review." : "Sales user updated progress after follow-up.",
          oldValue: "New",
          newValue: lead.status
        });
      }

      if (lead.nextFollowUpAt) {
        entries.push({
          lead: lead._id,
          actor,
          type: "follow_up_scheduled",
          message: `Follow-up scheduled for ${lead.nextFollowUpAt.toISOString()}`,
          note: lead.followUpNote,
          newValue: lead.nextFollowUpAt.toISOString()
        });
      }

      if (index % 3 === 0) {
        entries.push({
          lead: lead._id,
          actor,
          type: "note_added",
          message: "Note added",
          note: "Demo data note for reviewing the activity timeline."
        });
      }

      return entries;
    })
  );

  console.log(
    `Demo data ready: ${leads.length} leads. Admin ${DEMO_CREDENTIALS.admin.email} / ${DEMO_CREDENTIALS.admin.password}. Sales ${DEMO_CREDENTIALS.sales.email} / ${DEMO_CREDENTIALS.sales.password}.`
  );
}
