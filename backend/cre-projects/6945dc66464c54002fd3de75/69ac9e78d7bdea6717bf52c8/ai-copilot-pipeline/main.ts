import { cre, Runner, consensusMedianAggregation, getNetwork, encodeCallMsg, prepareReportRequest, LAST_FINALIZED_BLOCK_NUMBER, type Runtime, type CronPayload, type NodeRuntime } from "@chainlink/cre-sdk"
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


  // EVM Read: Read ETH/USD Price
  const evmClient_evmRead1772926794963 = new cre.capabilities.EVMClient(getNetwork({
    chainFamily: "evm",
    chainSelectorName: config.evms[0].chainSelectorName,
    isTestnet: true,
  }).chainSelector.selector)
  const evmRead1772926794963 = evmClient_evmRead1772926794963.callContract(runtime, {
    call: encodeCallMsg({ from: "0x0000000000000000000000000000000000000000", to: config.evms[0].contractAddress, data: "0x" }),
    blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
  }).result()

  // Condition: Price < $2000?
  const condition1772926794964 = true // No condition expression configured

  if (condition1772926794964) {
    // EVM Write: Execute Buy Order
    const evmClient_evmWrite1772926794965 = new cre.capabilities.EVMClient(getNetwork({
      chainFamily: "evm",
      chainSelectorName: config.evms[0].chainSelectorName,
      isTestnet: true,
    }).chainSelector.selector)
    const reportData_evmWrite1772926794965 = encodeAbiParameters(
      parseAbiParameters("uint256"),
      [condition1772926794964]
    )
    const report_evmWrite1772926794965 = runtime.report(prepareReportRequest(reportData_evmWrite1772926794965)).result()
    evmClient_evmWrite1772926794965.writeReport(runtime, {
      receiver: config.evms[0].contractAddress,
      report: report_evmWrite1772926794965,
    }).result()
    runtime.log("Report written on-chain")

    // HTTP Fetch: Send Discord Alert
    const httpFetch1772926794966 = runtime.runInNodeMode(
      (nodeRuntime: NodeRuntime) => {
        const httpClient = new cre.capabilities.HTTPClient()
        const response = httpClient.sendRequest(nodeRuntime, {
          url: nodeRuntime.config.apiUrl,
          method: "POST",
        }).result()
        return JSON.parse(new TextDecoder().decode(response.body))
      },
      consensusMedianAggregation()
    )().result()
    runtime.log(`HTTP response: ${JSON.stringify(httpFetch1772926794966)}`)

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
