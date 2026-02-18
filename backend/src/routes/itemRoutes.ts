import express from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getItems)
  .post(protect, createItem);

router.route('/:id')
  .get(protect, getItem)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

export default router;
