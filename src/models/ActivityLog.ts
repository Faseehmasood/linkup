import mongoose, { Schema } from "mongoose";

export interface IActivityLog {
  projectId: mongoose.Types.ObjectId;
  action:
    | "milestone_completed"
    | "milestone_created"
    | "milestone_updated"
    | "file_uploaded"
    | "invoice_created"
    | "invoice_sent"
    | "invoice_paid"
    | "client_invited"
    | "project_created"
    | "project_updated";
  description: string;
  performedBy: mongoose.Types.ObjectId;
  performedByRole: "freelancer" | "client";
  createdAt: Date;
}

type ActivityLogModel = mongoose.Model<IActivityLog>;

const ActivityLogSchema = new Schema<IActivityLog, ActivityLogModel>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    action: {
      type: String,
      enum: {
        values: [
          "milestone_completed",
          "milestone_created",
          "milestone_updated",
          "file_uploaded",
          "invoice_created",
          "invoice_sent",
          "invoice_paid",
          "client_invited",
          "project_created",
          "project_updated",
        ],
        message: "{VALUE} is not a valid action",
      },
      required: [true, "Action is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      required: [true, "Performer is required"],
      refPath: "performedByRole",
    },
    performedByRole: {
      type: String,
      enum: {
        values: ["freelancer", "client"],
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ActivityLog =
  mongoose.models.ActivityLog as ActivityLogModel ||
  mongoose.model<IActivityLog, ActivityLogModel>(
    "ActivityLog",
    ActivityLogSchema
  );

export default ActivityLog;