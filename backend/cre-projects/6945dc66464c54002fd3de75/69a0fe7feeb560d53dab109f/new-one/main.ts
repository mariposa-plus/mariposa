import { cre, Runner, type Runtime } from "@chainlink/cre-sdk"
import { z } from "zod"

const configSchema = z.object({
  schedule: z.string()
})
type Config = z.infer<typeof configSchema>

const onTrigger = (runtime: Runtime<Config>, payload: CronPayload): string => {

  return "complete"
}

const initWorkflow = (config: Config) => {
  const cron = new cre.capabilities.CronCapability()
  return [cre.handler(cron.trigger({ schedule: config.schedule }), onTrigger)]
}

export async function main() {
  const runner = await Runner.newRunner<Config>({ configSchema })
  await runner.run(initWorkflow)
}

main()
