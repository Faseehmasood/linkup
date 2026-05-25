import mongoose, { Schema } from "mongoose";

export interface IClient {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  freelancerId: mongoose.Types.ObjectId;
  magicLinkToken?: string;
  tokenExpiry?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ClientModel = mongoose.Model<IClient>;

const ClientSchema = new Schema<IClient, ClientModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Freelancer is required"],
    },
    magicLinkToken: {
      type: String,
    },
    tokenExpiry: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Client =
  mongoose.models.Client as ClientModel ||
  mongoose.model<IClient, ClientModel>("Client", ClientSchema);

export default Client;