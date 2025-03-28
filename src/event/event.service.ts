import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventStatus, AttendanceStatus } from './interfaces/event.interface';
import { BookingDto } from './dto/booking.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { AttendanceDto } from './dto/attendance.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ChefService } from '../chef/chef.service';
import { CustomerService } from '../customer/customer.service';
import { UserRole } from '../users/interfaces/user.interface';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private readonly eventModel: Model<Event>,
    private readonly chefService: ChefService,
    private readonly customerService: CustomerService,
  ) {}

  async createBooking(customerId: string, bookingDto: BookingDto) {
    // Verify location exists
    const location = await this.customerService.getLocationById(bookingDto.locationId);
    if (!location) {
      throw new HttpException('Location not found', HttpStatus.NOT_FOUND);
    }

    // Ensure location belongs to customer
    if (location.userId.toString() !== customerId) {
      throw new HttpException('Location does not belong to customer', HttpStatus.FORBIDDEN);
    }

    // Create event
    const event = new this.eventModel({
      customer: customerId,
      chef: bookingDto.chefId,
      location: bookingDto.locationId,
      menuItems: bookingDto.menuItems,
      dateTime: new Date(bookingDto.dateTime),
      specialRequests: bookingDto.specialRequests,
      status: EventStatus.PENDING,
    });

    await event.save();

    return { message: 'Booking request sent to chef' };
  }

  async confirmBooking(chefId: string, eventId: string, confirmBookingDto: ConfirmBookingDto) {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    // Ensure event belongs to chef
    if (event.chef.toString() !== chefId) {
      throw new HttpException('Event does not belong to chef', HttpStatus.FORBIDDEN);
    }

    // Update event status
    event.status = confirmBookingDto.status === 'confirmed' 
      ? EventStatus.CONFIRMED 
      : EventStatus.REJECTED;
    
    if (confirmBookingDto.status === 'rejected' && confirmBookingDto.reason) {
      event.rejectionReason = confirmBookingDto.reason;
    }

    await event.save();

    return { message: 'Booking status updated' };
  }

  async getBookingStatus(eventId: string) {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    return { status: event.status };
  }

  async markAttendance(chefId: string, eventId: string, attendanceDto: AttendanceDto) {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    // Ensure event belongs to chef
    if (event.chef.toString() !== chefId) {
      throw new HttpException('Event does not belong to chef', HttpStatus.FORBIDDEN);
    }

    // Update attendance status
    event.attendance = {
      status: attendanceDto.status as AttendanceStatus,
      remarks: attendanceDto.remarks,
      markedAt: new Date(),
    };

    await event.save();

    return { message: 'Attendance marked' };
  }

  async getEvents(userId: string, userRole: UserRole, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter events based on user role
    if (userRole === UserRole.CUSTOMER) {
      query = { customer: userId };
    } else if (userRole === UserRole.CHEF) {
      query = { chef: userId };
    }
    
    const [events, totalCount] = await Promise.all([
      this.eventModel
        .find(query)
        .populate('chef', 'firstName lastName')
        .populate('customer', 'firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ dateTime: -1 })
        .exec(),
      this.eventModel.countDocuments(query).exec(),
    ]);

    const formattedEvents = events.map(event => ({
      eventId: event._id,
      chefName: `${(event.chef as any).firstName} ${(event.chef as any).lastName}`,
      customerName: `${(event.customer as any).firstName} ${(event.customer as any).lastName}`,
      status: event.status,
      dateTime: event.dateTime,
    }));

    return {
      events: formattedEvents,
      totalCount,
      page,
      limit,
    };
  }

  async getEventById(eventId: string) {
    const event = await this.eventModel.findById(eventId)
      .populate('chef', 'firstName lastName')
      .populate('customer', 'firstName lastName')
      .populate('location')
      .exec();
      
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    
    return event;
  }
}
