import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChefService } from 'src/chef/chef.service';
import { Chef } from 'src/chef/interfaces/chef.interface';
import { User } from 'src/users/interfaces/user.interface';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuItem } from './interfaces/menu.interfaces';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel('Menu') private readonly menuModel: Model<MenuItem>,
    @InjectModel('Chef') private readonly chefModel: Model<Chef>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly chefService: ChefService,
  ) {}
  /* 
      API REQUESTS FOR CHEFS ONLY 
  */
  async create(createMenuDto: CreateMenuDto, userInfo: User) {
    const userId = userInfo._id.toString();
    const menu = await this.menuModel.create({
      ...createMenuDto,
      chef: userId,
    });
    return {
      menu,
      message: 'Menu has been created successfully',
      success: true,
    };
  }

  async update(menuId: string, updateMenuDto: UpdateMenuDto, userInfo: User) {
    const userId = userInfo._id.toString();
    const chef = await this.chefService.getChefByUserId(userId);

    if (!chef) {
      return new HttpException(
        "Chef by this userId doen't exists",
        HttpStatus.NOT_FOUND,
      );
    }
    const chefId = chef._id;

    const menu = await this.menuModel.findByIdAndUpdate(
      menuId,
      {
        ...updateMenuDto,
        chef: chefId,
      },
      { new: true },
    );

    return {
      menu,
      message: 'Menu has been edited successfully',
      success: true,
    };
  }

  async getCurrentChefMenus(userInfo: User) {
    const userId = userInfo._id.toString();
    const chef = await this.chefService.getChefByUserId(userId);
    if (!chef) {
      return new HttpException(
        "Chef by this userId doen't exists",
        HttpStatus.NOT_FOUND,
      );
    }
    const chefId = chef._id;
    const menus = await this.menuModel.find({ chef: chefId });
    return { menus, success: true };
  }

  async getMenuById(id: string) {
    try {
      return await this.menuModel.findById(id).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        // Handle invalid ObjectId format
        throw new HttpException('No item found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'An error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const res = await this.menuModel
        .findByIdAndDelete(id, { new: true })
        .exec();
      console.log({ res });
      return { success: true, message: 'Memu deleted successfully' };
    } catch (error) {
      if (error.name === 'CastError') {
        // Handle invalid ObjectId format
        throw new HttpException('No item found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'An error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /* 
      API REQUESTS FOR CUSTOMERS ONLY 
  */

  async getAllMenuByChef(chefId: string) {
    const chef = await this.chefService.findChefById(chefId);
    if (!chef) {
      return new HttpException(
        "Chef by this userId doen't exists",
        HttpStatus.NOT_FOUND,
      );
    }
    const menus = await this.menuModel.find({ chef: chefId });
    return { menus, success: true };
  }
}
