import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Matches,
  IsOptional,
} from 'class-validator';
import { UserRole } from 'src/users/interfaces/user.interface';

export class RegisterDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  role?: UserRole.CHEF | UserRole.CUSTOMER;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format (e.g., +123456789)',
  })
  phoneNumber: string;
}

export class ChefAuthDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format (e.g., +123456789)',
  })
  phoneNumber: string;
}
