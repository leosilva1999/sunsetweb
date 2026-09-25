export type ReportTargetType = "Photo" | "Comment";
export type ReportReason = "Spam" | "Inappropriate" | "Harassment" | "Other";
export type ReportStatus = "Pending" | "Resolved" | "Dismissed";

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedByUserId: string | null;
  resolvedAt: string | null;
}
