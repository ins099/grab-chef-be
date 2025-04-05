import { Document } from 'mongoose';
import { Types } from 'mongoose';

export enum ChefVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Chef extends Document {
  userId: Types.ObjectId;
  idCard?: string;
  certificates?: string;
  bio?: string;
  status?: ChefVerificationStatus;
  rating?: number;
  createdAt?: Date;
}
