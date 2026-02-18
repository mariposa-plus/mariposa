/**
 * Solidity Contract Components
 * Smart contract components for the on-chain side of CRE workflows
 */

import { ComponentSchema } from '@/types';

const IRECEIVER_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

contract DataConsumer is IReceiver {
    address public immutable forwarder;

    uint256 public latestValue;
    uint256 public lastUpdated;

    event ReportReceived(uint256 value, uint256 timestamp);

    constructor(address _forwarder) {
        forwarder = _forwarder;
    }

    modifier onlyForwarder() {
        require(msg.sender == forwarder, "Only Forwarder");
        _;
    }

    function onReport(bytes calldata metadata, bytes calldata report) external onlyForwarder {
        uint256 value = abi.decode(report, (uint256));
        latestValue = value;
        lastUpdated = block.timestamp;
        emit ReportReceived(value, block.timestamp);
    }
}`;

const PRICE_FEED_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

contract PriceFeedConsumer is IReceiver {
    address public immutable forwarder;

    int256 public latestPrice;
    uint8 public decimals;
    uint256 public lastUpdated;

    event PriceUpdated(int256 price, uint8 decimals, uint256 timestamp);

    constructor(address _forwarder, uint8 _decimals) {
        forwarder = _forwarder;
        decimals = _decimals;
    }

    modifier onlyForwarder() {
        require(msg.sender == forwarder, "Only Forwarder");
        _;
    }

    function onReport(bytes calldata metadata, bytes calldata report) external onlyForwarder {
        int256 price = abi.decode(report, (int256));
        latestPrice = price;
        lastUpdated = block.timestamp;
        emit PriceUpdated(price, decimals, block.timestamp);
    }

    function getLatestPrice() external view returns (int256, uint8, uint256) {
        return (latestPrice, decimals, lastUpdated);
    }
}`;

const CUSTOM_DATA_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

contract CustomDataConsumer is IReceiver {
    address public immutable forwarder;

    // Customize this struct for your data
    struct DataPoint {
        uint256 value;
        uint256 timestamp;
        bytes32 dataId;
    }

    DataPoint public latestData;

    event DataReceived(uint256 value, uint256 timestamp, bytes32 dataId);

    constructor(address _forwarder) {
        forwarder = _forwarder;
    }

    modifier onlyForwarder() {
        require(msg.sender == forwarder, "Only Forwarder");
        _;
    }

    function onReport(bytes calldata metadata, bytes calldata report) external onlyForwarder {
        (uint256 value, uint256 timestamp, bytes32 dataId) = abi.decode(report, (uint256, uint256, bytes32));
        latestData = DataPoint(value, timestamp, dataId);
        emit DataReceived(value, timestamp, dataId);
    }
}`;

const PROOF_OF_RESERVE_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

contract ProofOfReserve is IReceiver {
    address public immutable forwarder;

    uint256 public totalReserves;
    uint256 public totalSupply;
    uint256 public lastVerified;
    bool public isCollateralized;

    event ReserveVerified(uint256 reserves, uint256 supply, bool collateralized, uint256 timestamp);

    constructor(address _forwarder) {
        forwarder = _forwarder;
    }

    modifier onlyForwarder() {
        require(msg.sender == forwarder, "Only Forwarder");
        _;
    }

    function onReport(bytes calldata metadata, bytes calldata report) external onlyForwarder {
        (uint256 reserves, uint256 supply) = abi.decode(report, (uint256, uint256));
        totalReserves = reserves;
        totalSupply = supply;
        isCollateralized = reserves >= supply;
        lastVerified = block.timestamp;
        emit ReserveVerified(reserves, supply, isCollateralized, block.timestamp);
    }
}`;

const EVENT_EMITTER_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EventEmitter {
    event DataRequested(address indexed requester, bytes32 indexed requestId, bytes data);
    event CustomEvent(uint256 indexed value, string message);

    uint256 public requestCount;

    function emitDataRequest(bytes32 requestId, bytes calldata data) external {
        requestCount++;
        emit DataRequested(msg.sender, requestId, data);
    }

    function emitCustomEvent(uint256 value, string calldata message) external {
        emit CustomEvent(value, message);
    }
}`;

export const SOLIDITY_CONTRACT_COMPONENTS: Record<string, ComponentSchema> = {
  'ireceiver-contract': {
    id: 'ireceiver-contract',
    name: 'IReceiver Contract',
    category: 'solidity-contracts',
    description: 'Base consumer contract template with onReport function',
    icon: 'FileCode2',
    color: '#ea580c',
    type: 'solidity',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      contractName: {
        type: 'text',
        label: 'Contract Name',
        placeholder: 'DataConsumer',
        required: true,
      },
      solidityCode: {
        type: 'monaco-solidity',
        label: 'Solidity Source',
        defaultValue: IRECEIVER_TEMPLATE,
        required: true,
      },
      forwarderAddress: {
        type: 'text',
        label: 'Forwarder Address',
        placeholder: '0x...',
        helpText: 'Chainlink KeystoneForwarder address for your network',
        validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
      },
      constructorArgs: {
        type: 'json',
        label: 'Constructor Arguments',
        placeholder: '["0x..."]',
        helpText: 'JSON array of constructor arguments',
      },
      chainSelector: {
        type: 'chain-select',
        label: 'Deploy Chain',
      },
    },
    outputs: [
      { id: 'address', label: 'Contract Address', type: 'string' },
      { id: 'abi', label: 'Contract ABI', type: 'object' },
      { id: 'txHash', label: 'Deploy TX Hash', type: 'string' },
    ],
  },

  'price-feed-consumer': {
    id: 'price-feed-consumer',
    name: 'Price Feed Consumer',
    category: 'solidity-contracts',
    description: 'Consumer contract that stores price data from CRE workflow',
    icon: 'TrendingUp',
    color: '#ea580c',
    type: 'solidity',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      contractName: {
        type: 'text',
        label: 'Contract Name',
        placeholder: 'PriceFeedConsumer',
        defaultValue: 'PriceFeedConsumer',
      },
      solidityCode: {
        type: 'monaco-solidity',
        label: 'Solidity Source',
        defaultValue: PRICE_FEED_TEMPLATE,
        required: true,
      },
      decimals: {
        type: 'number',
        label: 'Price Decimals',
        defaultValue: 8,
        validation: { min: 0, max: 18 },
        helpText: 'Number of decimal places in the price value',
      },
      chainSelector: {
        type: 'chain-select',
        label: 'Deploy Chain',
      },
    },
    outputs: [
      { id: 'address', label: 'Contract Address', type: 'string' },
      { id: 'abi', label: 'Contract ABI', type: 'object' },
      { id: 'price', label: 'Latest Price', type: 'number' },
    ],
  },

  'custom-data-consumer': {
    id: 'custom-data-consumer',
    name: 'Custom Data Consumer',
    category: 'solidity-contracts',
    description: 'Generic consumer with configurable struct decoding',
    icon: 'DatabaseZap',
    color: '#ea580c',
    type: 'solidity',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      contractName: {
        type: 'text',
        label: 'Contract Name',
        placeholder: 'CustomDataConsumer',
        defaultValue: 'CustomDataConsumer',
      },
      solidityCode: {
        type: 'monaco-solidity',
        label: 'Solidity Source',
        defaultValue: CUSTOM_DATA_TEMPLATE,
        required: true,
      },
      structDefinition: {
        type: 'textarea',
        label: 'Struct Definition',
        placeholder: 'uint256 value, uint256 timestamp, bytes32 dataId',
        helpText: 'Describe the data struct fields (for documentation)',
      },
      chainSelector: {
        type: 'chain-select',
        label: 'Deploy Chain',
      },
    },
    outputs: [
      { id: 'address', label: 'Contract Address', type: 'string' },
      { id: 'abi', label: 'Contract ABI', type: 'object' },
    ],
  },

  'proof-of-reserve': {
    id: 'proof-of-reserve',
    name: 'Proof of Reserve',
    category: 'solidity-contracts',
    description: 'PoR verification contract template',
    icon: 'ShieldCheck',
    color: '#ea580c',
    type: 'solidity',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      contractName: {
        type: 'text',
        label: 'Contract Name',
        placeholder: 'ProofOfReserve',
        defaultValue: 'ProofOfReserve',
      },
      solidityCode: {
        type: 'monaco-solidity',
        label: 'Solidity Source',
        defaultValue: PROOF_OF_RESERVE_TEMPLATE,
        required: true,
      },
      chainSelector: {
        type: 'chain-select',
        label: 'Deploy Chain',
      },
    },
    outputs: [
      { id: 'address', label: 'Contract Address', type: 'string' },
      { id: 'reserves', label: 'Total Reserves', type: 'number' },
      { id: 'isCollateralized', label: 'Is Collateralized', type: 'boolean' },
    ],
  },

  'event-emitter': {
    id: 'event-emitter',
    name: 'Event Emitter',
    category: 'solidity-contracts',
    description: 'Contract that emits events for EVM Log Trigger',
    icon: 'Radio',
    color: '#ea580c',
    type: 'solidity',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      contractName: {
        type: 'text',
        label: 'Contract Name',
        placeholder: 'EventEmitter',
        defaultValue: 'EventEmitter',
      },
      solidityCode: {
        type: 'monaco-solidity',
        label: 'Solidity Source',
        defaultValue: EVENT_EMITTER_TEMPLATE,
        required: true,
      },
      eventSignature: {
        type: 'text',
        label: 'Primary Event Signature',
        placeholder: 'DataRequested(address,bytes32,bytes)',
        helpText: 'The main event signature this contract emits',
      },
      chainSelector: {
        type: 'chain-select',
        label: 'Deploy Chain',
      },
    },
    outputs: [
      { id: 'address', label: 'Contract Address', type: 'string' },
      { id: 'eventAbi', label: 'Event ABI', type: 'object' },
    ],
  },
};
