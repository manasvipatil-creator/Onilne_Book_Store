import { Response } from 'express';
import { Address } from '../models/Address.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getAddresses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, data: { addresses } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { fullName, mobile, house, street, city, state, pincode, country, isDefault } = req.body;

    if (!fullName || !mobile || !house || !street || !city || !state || !pincode) {
      res.status(400).json({ success: false, message: 'Please provide all required address fields' });
      return;
    }

    // If marked default or first address, reset other default addresses
    const count = await Address.countDocuments({ userId });
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      fullName,
      mobile,
      house,
      street,
      city,
      state,
      pincode,
      country: country || 'India',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({ success: true, message: 'Address added successfully', data: { address } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add address', error: error.message });
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { fullName, mobile, house, street, city, state, pincode, country, isDefault } = req.body;

    const address = await Address.findOne({ _id: id, userId });
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
      address.isDefault = true;
    }

    if (fullName) address.fullName = fullName;
    if (mobile) address.mobile = mobile;
    if (house) address.house = house;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (country) address.country = country;

    await address.save();
    res.json({ success: true, message: 'Address updated successfully', data: { address } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, userId });
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    // If default was deleted, set next address as default if exists
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};
