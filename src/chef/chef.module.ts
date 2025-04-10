import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChefService } from './chef.service';
import { ChefController } from './chef.controller';
import { ChefSchema } from './schemas/chef.schema';
import { UsersModule } from '../users/users.module';
import { UtilsModule } from '../utils/utils.module';
import { MenuSchema } from 'src/menu/schemas/menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chef', schema: ChefSchema },
      { name: 'MenuItem', schema: MenuSchema },
    ]),
    UsersModule,
    UtilsModule,
  ],
  controllers: [ChefController],
  providers: [ChefService],
  exports: [ChefService],
})
export class ChefModule {}
