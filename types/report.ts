export type ReportTargetType = "Photo" | "Comment";
export type ReportReason = "Spam" | "Inappropriate" | "Harassment" | "Other";
export type ReportStatus = "Pending" | "Resolved" | "Dismissed";

export type ModerationActionType =
  | "PhotoDeleted"
  | "CommentDeleted"
  | "ReportResolved"
  | "ReportDismissed"
  | "LegalDocumentUpdated"
  | "UserRoleChanged";

export interface ModerationAction {
  id: string;
  moderatorId: string;
  moderatorName: string;
  actionType: ModerationActionType;
  targetDescription: string;
  notes: string | null;
  createdAt: string;
}

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
