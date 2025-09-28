export const paymentManagerAbi = [
  // Micropayments
  {
    type: "function",
    name: "createMicropayment",
    stateMutability: "payable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "memo", type: "string" },
    ],
    outputs: [{ name: "paymentId", type: "bytes32" }],
  },
  // Subscriptions
  {
    type: "function",
    name: "createSubscription",
    stateMutability: "payable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "months", type: "uint256" },
      { name: "memo", type: "string" },
    ],
    outputs: [{ name: "subId", type: "bytes32" }],
  },
  // Refund
  {
    type: "function",
    name: "refundPayment",
    stateMutability: "nonpayable",
    inputs: [{ name: "paymentId", type: "bytes32" }],
    outputs: [],
  },

  // Events
  {
    type: "event",
    name: "PurchaseCreated",
    inputs: [
      { name: "id", type: "bytes32", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "kind", type: "string", indexed: false },
      { name: "memo", type: "string", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PurchaseCompleted",
    inputs: [{ name: "id", type: "bytes32", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "RefundProcessed",
    inputs: [
      { name: "id", type: "bytes32", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;