export type ReportTargetType = "Photo" | "Comment" | "Location" | "User";
// IncorrectInfo é pensado pra locais ("o pino/nome/cidade está errado").
export type ReportReason = "Spam" | "Inappropriate" | "Harassment" | "Other" | "IncorrectInfo";
export type ReportStatus = "Pending" | "Resolved" | "Dismissed";

export type ModerationActionType =
  | "PhotoDeleted"
  | "CommentDeleted"
  | "ReportResolved"
  | "ReportDismissed"
  | "LegalDocumentUpdated"
  | "UserRoleChanged"
  | "UserBanned"
  | "UserUnbanned"
  | "UserAnonymized"
  | "LocationDeleted"
  | "LocationRestored"
  | "LocationCoordinatesChanged"
  | "LocationMerged";

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
