import mongoose from 'mongoose';
import { User, IUser, RegisterDTO, UserResponse, ReliabilityMetrics } from '../models/User.js';

export const userService = {
  async createUser(dto: RegisterDTO): Promise<UserResponse> {
    try {
      const existingUser = await User.findOne({ emailOrPhone: dto.emailOrPhone.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email or phone already exists.');
      }

      const emailVal = dto.email || (dto.emailOrPhone.includes('@') ? dto.emailOrPhone : '');
      const phoneVal = dto.phone || (!dto.emailOrPhone.includes('@') ? dto.emailOrPhone : '');

      const newUser = new User({
        name: dto.name,
        email: emailVal,
        phone: phoneVal,
        emailOrPhone: dto.emailOrPhone.toLowerCase(),
        passwordHash: dto.password ? dto.password : undefined,
        role: dto.role,
        verificationStatus: dto.verificationStatus || (dto.role === 'farmer' ? 'PENDING' : 'VERIFIED'),
        state: dto.state || 'Uttar Pradesh',
        district: dto.district || 'Gorakhpur',
        village: dto.village || '',
        primaryCrop: dto.primaryCrop || '',
        farmInfo: dto.farmInfo,
        deliveryAddress: dto.deliveryAddress,
        businessInfo: dto.businessInfo,
        vehicleInfo: dto.vehicleInfo
      });

      const savedUser = await newUser.save();
      return this.toUserResponse(savedUser);
    } catch (err: any) {
      console.error('Error creating user:', err);
      throw new Error(err.message || 'Unable to register user account.');
    }
  },

  async getUserById(id: string): Promise<UserResponse | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findById(id);
    if (!user) return null;
    return this.toUserResponse(user);
  },

  async findUserById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await User.findById(id);
  },

  async getUserByEmailOrPhone(identifier: string): Promise<IUser | null> {
    return await User.findOne({ emailOrPhone: identifier.toLowerCase() });
  },

  async findUserByEmailOrPhone(identifier: string): Promise<IUser | null> {
    return await User.findOne({ emailOrPhone: identifier.toLowerCase() });
  },

  async updateUserProfile(userId: string, updates: Partial<RegisterDTO>): Promise<UserResponse | null> {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      if (updates.name) user.name = updates.name;
      if (updates.state) user.state = updates.state;
      if (updates.district) user.district = updates.district;
      if (updates.village) user.village = updates.village;
      if (updates.primaryCrop) user.primaryCrop = updates.primaryCrop;
      if (updates.profileImage) user.profileImage = updates.profileImage;
      if (updates.farmInfo) user.farmInfo = { ...user.farmInfo, ...updates.farmInfo };
      if (updates.deliveryAddress) user.deliveryAddress = { ...user.deliveryAddress, ...updates.deliveryAddress };
      if (updates.businessInfo) user.businessInfo = { ...user.businessInfo, ...updates.businessInfo };
      if (updates.vehicleInfo) user.vehicleInfo = { ...user.vehicleInfo, ...updates.vehicleInfo };

      const updated = await user.save();
      return this.toUserResponse(updated);
    } catch (err) {
      console.error('Error updating user profile:', err);
      return null;
    }
  },

  toUserResponse(user: IUser): UserResponse {
    const defaultReliability: ReliabilityMetrics = {
      score: 70,
      totalOrders: 0,
      completedOrders: 0,
      disputesRaisedAgainst: 0,
      disputesResolved: 0,
      avgPaymentDelayDays: 0,
      badge: 'new'
    };

    return {
      id: user._id ? user._id.toString() : '',
      name: user.name,
      email: user.email || user.emailOrPhone,
      phone: user.phone || '',
      emailOrPhone: user.emailOrPhone || user.email,
      role: user.role || 'farmer',
      phoneVerified: !!user.phoneVerified,
      emailVerified: !!user.emailVerified,
      verificationStatus: user.verificationStatus || 'VERIFIED',
      state: user.state,
      district: user.district,
      village: user.village || '',
      primaryCrop: user.primaryCrop || '',
      profileImage: user.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      farmInfo: user.farmInfo,
      deliveryAddress: user.deliveryAddress,
      businessInfo: user.businessInfo,
      vehicleInfo: user.vehicleInfo,
      reliability: user.reliability || defaultReliability,
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()
    };
  }
};
