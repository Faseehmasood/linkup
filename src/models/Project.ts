import mongoose, { Schema } from "mongoose";

export interface IProject {
  title: string;
  description?: string;
  status: "active" | "completed" | "on hold";
  deadline?: Date;
  totalAmount: number;
  currency: "USD" | "EUR" | "GBP" | "PKR";
  freelancerId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type ProjectModel = mongoose.Model<IProject>;

const ProjectSchema = new Schema<IProject, ProjectModel>(
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
    status: {
      type: String,
      enum: {
        values: ["active", "completed", "on-hold"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
    deadline: {
      type: Date,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      enum: {
        values: ["USD", "EUR", "GBP", "PKR"],
        message: "{VALUE} is not a valid currency",
      },
      default: "USD",
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Freelancer is required"],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Project =
  mongoose.models.Project as ProjectModel ||
  mongoose.model<IProject, ProjectModel>("Project", ProjectSchema);

export default Project;