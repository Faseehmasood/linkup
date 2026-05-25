import mongoose, { Schema } from "mongoose";

export interface IMilestone {
  title: string;
  description?: string;
  amount: number;
  dueDate?: Date;
  status: "pending" | "in-progress" | "completed";
  completedAt?: Date;
  projectId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type MilestoneModel = mongoose.Model<IMilestone>;

const MilestoneSchema = new Schema<IMilestone, MilestoneModel>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "in-progress", "completed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Milestone =
  mongoose.models.Milestone as MilestoneModel ||
  mongoose.model<IMilestone, MilestoneModel>("Milestone", MilestoneSchema);

export default Milestone;