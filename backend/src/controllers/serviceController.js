import { inMemoryStore } from '../store/inMemoryStore.js';

export const getCategories = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      categories: inMemoryStore.categories
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const services = inMemoryStore.getServices(category);
    return res.status(200).json({
      success: true,
      services,
      total: services.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = inMemoryStore.getServiceById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    return res.status(200).json({
      success: true,
      service
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
