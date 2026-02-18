import Pipeline from '../models/Pipeline';
import { queuePipelineExecution } from '../queues/executionQueue';
import parser from 'cron-parser';

/**
 * Scheduler Service - Manages time-based pipeline triggers
 */
export class SchedulerService {
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Start the scheduler service
   */
  start(): void {
    if (this.checkInterval) {
      console.log('⚠️  Scheduler already running');
      return;
    }

    console.log('🕐 Starting scheduler service...');

    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkSchedules();
    }, 60 * 1000); // Every 60 seconds

    // Also run immediately on start
    this.checkSchedules();
  }

  /**
   * Stop the scheduler service
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 Scheduler service stopped');
    }
  }

  /**
   * Check all pipelines for scheduled triggers
   */
  private async checkSchedules(): Promise<void> {
    try {
      const now = new Date();
      console.log(`🕐 Checking schedules at ${now.toISOString()}`);

      // Find all pipelines
      const pipelines = await Pipeline.find({ isActive: { $ne: false } });

      for (const pipeline of pipelines) {
        // Find scheduler trigger nodes (nodes with no incoming edges)
        const triggerNodes = this.findSchedulerTriggerNodes(pipeline);

        for (const schedulerNode of triggerNodes) {
          const config = schedulerNode.data?.config;

          if (!config || !config.enabled) {
            continue;
          }

          const shouldTrigger = this.shouldTriggerNow(config, now);

          if (shouldTrigger) {
            console.log(`⏰ Triggering scheduled pipeline: ${pipeline.name} (${pipeline._id})`);

            // Queue the pipeline execution
            await queuePipelineExecution({
              executionId: `sched-${Date.now()}-${pipeline._id}`,
              pipelineId: pipeline._id.toString(),
              userId: pipeline.userId.toString(),
              triggerType: 'scheduler',
              triggerData: {
                schedulerNodeId: schedulerNode.id,
                scheduledTime: now.toISOString(),
                cronExpression: config.cronExpression,
              },
            });
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Error checking schedules:', error.message);
    }
  }

  /**
   * Find scheduler trigger nodes in a pipeline
   */
  private findSchedulerTriggerNodes(pipeline: any): any[] {
    // Find nodes with no incoming edges (trigger nodes)
    const nodesWithIncomingEdges = new Set(
      pipeline.edges.map((e: any) => e.target)
    );

    const triggerNodes = pipeline.nodes.filter(
      (node: any) => !nodesWithIncomingEdges.has(node.id)
    );

    // Filter for scheduler nodes only
    return triggerNodes.filter((node: any) => node.type === 'scheduler');
  }

  /**
   * Determine if a schedule should trigger now
   */
  private shouldTriggerNow(config: any, now: Date): boolean {
    try {
      if (config.type === 'one-time') {
        // One-time schedule
        if (!config.datetime) return false;

        const scheduledTime = new Date(config.datetime);
        const diffMs = Math.abs(now.getTime() - scheduledTime.getTime());

        // Trigger if within 1 minute of scheduled time
        return diffMs < 60 * 1000;
      } else if (config.type === 'recurring') {
        // Recurring schedule using cron
        if (!config.cronExpression) return false;

        try {
          const interval = parser.parseExpression(config.cronExpression, {
            currentDate: new Date(now.getTime() - 60 * 1000), // Check from 1 minute ago
            tz: config.timezone || 'UTC',
          });

          const nextRun = interval.next().toDate();
          const prevRun = interval.prev().toDate();

          // Check if we're in the current minute window
          const nowMs = now.getTime();
          const nextMs = nextRun.getTime();
          const prevMs = prevRun.getTime();

          // Trigger if the previous run was within the last minute
          const sinceLastRun = nowMs - prevMs;
          return sinceLastRun < 60 * 1000 && sinceLastRun >= 0;
        } catch (cronError: any) {
          console.error(`❌ Invalid cron expression: ${config.cronExpression}`, cronError.message);
          return false;
        }
      }

      return false;
    } catch (error: any) {
      console.error('❌ Error evaluating schedule:', error.message);
      return false;
    }
  }
}

// Singleton instance
export const schedulerService = new SchedulerService();
