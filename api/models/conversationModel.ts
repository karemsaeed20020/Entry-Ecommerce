import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
conversationSchema.index({ participants: 1 });

const Conversation: Model<IConversation> = mongoose.model<IConversation>("Conversation", conversationSchema);

export default Conversation;
