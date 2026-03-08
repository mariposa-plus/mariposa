import { cre, Runner, consensusMedianAggregation, getNetwork, encodeCallMsg, prepareReportRequest, type Runtime, type CronPayload, type NodeRuntime } from "@chainlink/cre-sdk"
import { z } from "zod"
import { encodeFunctionData, decodeFunctionResult, encodeAbiParameters, decodeAbiParameters, parseAbiParameters } from "viem"

const configSchema = z.object({
  schedule: z.string(),
  apiUrl: z.string().optional(),
  evms: z.array(z.object({
    chainSelectorName: z.string(),
    contractAddress: z.string(),
  }))
})
type Config = z.infer<typeof configSchema>

const initWorkflow = (config: Config) => {
  const onTrigger = (runtime: Runtime<Config>, payload: CronPayload): string => {
  // HTTP Fetch: fetching price of usdc
  const httpFetch1772924589605 = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime) => {
      const httpClient = new cre.capabilities.HTTPClient()
      const response = httpClient.sendRequest(nodeRuntime, {
        url: nodeRuntime.config.apiUrl,
        method: "GET",
      }).result()
      return JSON.parse(new TextDecoder().decode(response.body))
    },
    consensusMedianAggregation()
  )().result()
  runtime.log(`HTTP response: ${JSON.stringify(httpFetch1772924589605)}`)

  // Transform: Data Transform
  const dataTransform1772924721323 = (() => {
    const data = httpFetch1772924589605;
    /* @mariposa-transform {"mode":"simple","operation":"extract-single","fieldPath":"usd-coin.usd","outputName":"price"} */
    return { price: data["usd-coin"].usd };
  })()
  runtime.log(`Transform result: ${JSON.stringify(dataTransform1772924721323)}`)

  // Condition: Condition
  const condition1772924854051 = (() => {
    const data = dataTransform1772924721323;
    /* @mariposa-condition {"mode":"simple","conditions":[{"field":"data.price","operator":">","value":"1"}],"logic":"and"} */
    return data.price > 1;
  })()
  runtime.log(`Condition result: ${condition1772924854051}`)

  if (condition1772924854051) {
    // EVM Write: smart contract
    const evmClient_evmWrite1772924935835 = new cre.capabilities.EVMClient(getNetwork({
      chainFamily: "evm",
      chainSelectorName: config.evms[0].chainSelectorName,
      isTestnet: true,
    }).chainSelector.selector)
    const reportData_evmWrite1772924935835 = encodeAbiParameters(
      parseAbiParameters("uint256"),
      [condition1772924854051]
    )
    const report_evmWrite1772924935835 = runtime.report(prepareReportRequest(reportData_evmWrite1772924935835)).result()
    evmClient_evmWrite1772924935835.writeReport(runtime, {
      receiver: config.evms[0].contractAddress,
      report: report_evmWrite1772924935835,
    }).result()
    runtime.log("Report written on-chain")

  }
    return "complete"
  }

  const cron = new cre.capabilities.CronCapability()
  return [cre.handler(cron.trigger({ schedule: config.schedule }), onTrigger)]
}

export async function main() {
  const runner = await Runner.newRunner<Config>({ configSchema })
  await runner.run(initWorkflow)
}

main()
