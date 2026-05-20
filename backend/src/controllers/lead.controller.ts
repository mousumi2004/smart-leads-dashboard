import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { leadsToCsv } from "../utils/csv.js";
import * as leadService from "../services/lead.service.js";

export const createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.body, req.user!);
  return sendSuccess(res, 201, "Lead created", lead);
});

export const listLeads = asyncHandler(async (req, res) => {
  const { data, meta } = await leadService.listLeads(req.query as never, req.user!);
  return sendSuccess(res, 200, "Leads retrieved", data, meta);
});

export const getLead = asyncHandler(async (req, res) => {
  const lead = await leadService.getLeadById(req.params.id as string, req.user!);
  return sendSuccess(res, 200, "Lead retrieved", lead);
});

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(req.params.id as string, req.body, req.user!);
  return sendSuccess(res, 200, "Lead updated", lead);
});

export const deleteLead = asyncHandler(async (req, res) => {
  await leadService.deleteLead(req.params.id as string);
  return sendSuccess(res, 200, "Lead deleted", null);
});

export const stats = asyncHandler(async (req, res) => {
  const data = await leadService.getLeadStats(req.user!);
  return sendSuccess(res, 200, "Lead stats retrieved", data);
});

export const exportCsv = asyncHandler(async (req, res) => {
  const leads = await leadService.getLeadsForExport(req.query, req.user!);
  const csv = leadsToCsv(leads);
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.header("Content-Disposition", "attachment; filename=\"leads.csv\"");
  return res.status(200).send(csv);
});

export const activities = asyncHandler(async (req, res) => {
  const data = await leadService.getActivities(req.params.id as string, req.user!);
  return sendSuccess(res, 200, "Lead activities retrieved", data);
});

export const addNote = asyncHandler(async (req, res) => {
  const data = await leadService.addNote(req.params.id as string, req.body.note, req.user!);
  return sendSuccess(res, 201, "Lead note added", data);
});

export const followUps = asyncHandler(async (req, res) => {
  const data = await leadService.getFollowUps(req.user!, req.query.scope as never);
  return sendSuccess(res, 200, "Follow-ups retrieved", data);
});
