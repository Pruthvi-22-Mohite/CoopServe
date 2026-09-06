import mongoose from 'mongoose';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { inMemoryStore } from '../store/inMemoryStore.js';

export const getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_customer_demo';

    let user = null;
    if (mongoose.isValidObjectId(userId)) {
      user = await User.findOne({ $or: [{ _id: userId }, { id: userId }] });
    } else {
      user = await User.findOne({ id: userId });
    }

    if (!user) {
      user = inMemoryStore.findUserById(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    const { password: _, ...cleanUser } = userObj;

    return res.status(200).json({
      success: true,
      profile: {
        ...cleanUser,
        savedAddresses: [
          { id: 'addr_1', label: 'Home', address: 'Flat 402, Green Meadows, Kothrud, Pune - 411038', isDefault: true },
          { id: 'addr_2', label: 'Office', address: '4th Floor, Tech Park, Baner, Pune - 411045', isDefault: false }
        ],
        rewards: {
          points: cleanUser.rewardsPoints || 450,
          tier: 'Cooperative Silver Member',
          discountsAvailable: 2
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_customer_demo';
    const { name, phone, location } = req.body;

    const filter = mongoose.isValidObjectId(userId)
      ? { $or: [{ _id: userId }, { id: userId }] }
      : { id: userId };

    let updated = await User.findOneAndUpdate(
      filter,
      { $set: { ...(name && { name }), ...(phone && { phone }), ...(location && { location }) } },
      { new: true }
    );

    if (!updated) {
      updated = inMemoryStore.updateUserProfile(userId, { name, phone, location });
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userObj = updated.toObject ? updated.toObject() : { ...updated };
    const { password: _, ...cleanUser } = userObj;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: cleanUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_customer_demo';

    const mongoFilter = {
      $or: [
        { userId },
        ...(mongoose.isValidObjectId(userId) ? [{ userId: userId.toString() }] : [])
      ]
    };

    let notifications = await Notification.find(mongoFilter).sort({ createdAt: -1 });

    if (!notifications || notifications.length === 0) {
      notifications = inMemoryStore.getNotifications(userId);
    }

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    let notif = await Notification.findOneAndUpdate(
      filter,
      { $set: { read: true } },
      { new: true }
    );

    if (!notif) {
      notif = inMemoryStore.markNotificationAsRead(id);
    }

    return res.status(200).json({
      success: true,
      notification: notif
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
