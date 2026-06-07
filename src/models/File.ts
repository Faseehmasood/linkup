import mongoose, { Schema } from "mongoose";

export interface IFile {
  url: string;
  publicId: string;
  name: string;
  size: number;
  type: string;
  projectId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedByRole: "freelancer" | "client";
  createdAt: Date;
  updatedAt: Date;
}

type FileModel = mongoose.Model<IFile>;

const FileSchema = new Schema<IFile, FileModel>(
  {
    url: {
      type: String,
      required: [true, "URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Public ID is required"],
    },
    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
    type: {
      type: String,
      required: [true, "File type is required"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      required: [true, "Uploader is required"],
      refPath: "uploadedByRole",
    },
    uploadedByRole: {
      type: String,
      enum: {
        values: ["freelancer", "client"],
        message: "{VALUE} is not valid",
      },
      required: [true, "Role is required"],
    },
  },
  {
    timestamps: true,
  }
);

const File =
  mongoose.models.File as FileModel ||
  mongoose.model<IFile, FileModel>("File", FileSchema);

export default File;