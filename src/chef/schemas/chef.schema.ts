import {
  LocationSchema,
  LocationType,
  LocationDto,
} from 'src/common/interfaces/location.interface';
import * as mongoose from 'mongoose';
import { ChefVerificationStatus } from '../interfaces/chef.interface';

export const BusyDaysSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  timeSlots: [{ type: String, required: true, unique: true }],
});

export const ChefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  idCard: {
    type: String,
  },
  certificates: {
    type: String,
  },
  bio: {
    type: String,
  },
  status: {
    type: String,
    enum: Object.values(ChefVerificationStatus),
    default: ChefVerificationStatus.PENDING,
  },
  rating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  experience: {
    type: Number,
    default: 0,
  },
  locations: [LocationSchema],
  busyDays: [BusyDaysSchema],
});
