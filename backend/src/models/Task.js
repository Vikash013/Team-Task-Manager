import mongoose from 'mongoose';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskConstants.js';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: ''
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'Todo',
      index: true
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'Medium',
      index: true
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 24
      }
    ],
    dueDate: {
      type: Date,
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comments: [
      {
        body: {
          type: String,
          required: true,
          trim: true,
          maxlength: 700
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    activity: [
      {
        action: {
          type: String,
          required: true,
          trim: true
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        details: {
          type: String,
          trim: true,
          default: ''
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

taskSchema.virtual('isOverdue').get(function isOverdue() {
  return this.status !== 'Done' && this.dueDate && this.dueDate < new Date();
});

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
