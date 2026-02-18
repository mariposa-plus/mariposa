import { Response } from 'express';
import Item from '../models/Item';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all items
// @route   GET /api/items
// @access  Private
export const getItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Item.find().populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private
export const getItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate('createdBy', 'name email');

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
export const createItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, category } = req.body;

    const item = await Item.create({
      name,
      description,
      price,
      category,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    // Check if user is owner or admin
    if (item.createdBy.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this item',
      });
      return;
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    // Check if user is owner or admin
    if (item.createdBy.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item',
      });
      return;
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
