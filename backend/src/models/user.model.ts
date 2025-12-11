import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    telegram_id?: number;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Telegram users
    first_name: { type: String },
    last_name: { type: String },
    photo_url: { type: String },
    telegram_id: { type: Number, unique: true, sparse: true },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
