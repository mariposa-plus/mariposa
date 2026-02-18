import mongoose, { Document, Schema } from 'mongoose';

export type SchedulerTriggerType = 'once' | 'recurring' | 'cron';
export type RecurrenceFrequency = 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface SchedulerConfig {
  triggerType: SchedulerTriggerType;
  scheduledTime?: Date;
  cronExpression?: string;
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval: number; // e.g., every 2 days
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    time?: string; // HH:MM format
  };
  timezone?: string;
  enabled: boolean;
}

export interface IScheduledNode extends Document {
  pipelineId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  nodeId: string;
  config: SchedulerConfig;
  nextRunTime?: Date;
  lastRunTime?: Date;
  executionCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  calculateNextRunTime(): Date | null;
}

const ScheduledNodeSchema = new Schema<IScheduledNode>(
  {
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    config: {
      triggerType: {
        type: String,
        enum: ['once', 'recurring', 'cron'],
        required: true,
      },
      scheduledTime: Date,
      cronExpression: String,
      recurrence: {
        frequency: {
          type: String,
          enum: ['minutely', 'hourly', 'daily', 'weekly', 'monthly'],
        },
        interval: Number,
        dayOfWeek: Number,
        dayOfMonth: Number,
        time: String,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      enabled: {
        type: Boolean,
        default: true,
      },
    },
    nextRunTime: Date,
    lastRunTime: Date,
    executionCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active scheduled nodes
ScheduledNodeSchema.index({ isActive: 1, nextRunTime: 1 });

// Method to calculate next run time
ScheduledNodeSchema.methods.calculateNextRunTime = function (): Date | null {
  const { triggerType, scheduledTime, cronExpression, recurrence } = this.config;

  if (!this.config.enabled) {
    return null;
  }

  if (triggerType === 'once') {
    // One-time execution
    if (scheduledTime && new Date(scheduledTime) > new Date()) {
      return new Date(scheduledTime);
    }
    return null;
  }

  if (triggerType === 'cron') {
    // For cron expressions, we'll use node-cron parser
    // This is a placeholder - actual implementation would use a cron parser
    return new Date(Date.now() + 60000); // TODO: Implement proper cron parsing
  }

  if (triggerType === 'recurring' && recurrence) {
    const now = new Date();
    let nextRun = new Date(now);

    switch (recurrence.frequency) {
      case 'minutely':
        nextRun.setMinutes(nextRun.getMinutes() + (recurrence.interval || 1));
        break;
      case 'hourly':
        nextRun.setHours(nextRun.getHours() + (recurrence.interval || 1));
        break;
      case 'daily':
        nextRun.setDate(nextRun.getDate() + (recurrence.interval || 1));
        if (recurrence.time) {
          const [hours, minutes] = recurrence.time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7 * (recurrence.interval || 1));
        if (recurrence.dayOfWeek !== undefined) {
          const daysUntil = (recurrence.dayOfWeek - nextRun.getDay() + 7) % 7;
          nextRun.setDate(nextRun.getDate() + daysUntil);
        }
        if (recurrence.time) {
          const [hours, minutes] = recurrence.time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + (recurrence.interval || 1));
        if (recurrence.dayOfMonth) {
          nextRun.setDate(recurrence.dayOfMonth);
        }
        if (recurrence.time) {
          const [hours, minutes] = recurrence.time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        break;
    }

    return nextRun;
  }

  return null;
};

export default mongoose.model<IScheduledNode>('ScheduledNode', ScheduledNodeSchema);
