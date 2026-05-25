import mongoose, { Schema } from "mongoose";

export interface IInvoice {
  invoiceNumber: string;
  projectId: mongoose.Types.ObjectId;
  milestoneIds: mongoose.Types.ObjectId[];
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "PKR";
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate?: Date;
  paidAt?: Date;
  wiseEmail?: string;
  payoneerEmail?: string;
  pdfUrl?: string;
  freelancerId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type InvoiceModel = mongoose.Model<IInvoice>;

const InvoiceSchema = new Schema<IInvoice, InvoiceModel>(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    milestoneIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Milestone",
      },
    ],
    amount: {
      type: Number,
      required: [true, "Amount is required"],
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
    status: {
      type: String,
      enum: {
        values: ["draft", "sent", "paid", "overdue"],
        message: "{VALUE} is not a valid status",
      },
      default: "draft",
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    wiseEmail: {
      type: String,
      trim: true,
    },
    payoneerEmail: {
      type: String,
      trim: true,
    },
    pdfUrl: {
      type: String,
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

const Invoice =
  mongoose.models.Invoice as InvoiceModel ||
  mongoose.model<IInvoice, InvoiceModel>("Invoice", InvoiceSchema);

export default Invoice;