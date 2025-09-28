// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title X402 Payment Manager
/// @notice Handles Polygon micropayments / agentic payments for course purchases
contract X402PaymentManager {
    struct Payment {
        uint256 id;
        address payer;
        address payee;
        uint256 amount;
        string purpose;
        bool completed;
    }

    uint256 public paymentCount;
    mapping(uint256 => Payment) public payments;

    event PaymentInitiated(uint256 indexed id, address indexed payer, address indexed payee, uint256 amount, string purpose);
    event PaymentCompleted(uint256 indexed id);

    function initiatePayment(address payee, uint256 amount, string memory purpose) external payable {
        require(msg.value == amount, "Incorrect ETH sent");

        uint256 paymentId = paymentCount++;
        payments[paymentId] = Payment({
            id: paymentId,
            payer: msg.sender,
            payee: payee,
            amount: amount,
            purpose: purpose,
            completed: false
        });

        emit PaymentInitiated(paymentId, msg.sender, payee, amount, purpose);
    }

    function completePayment(uint256 paymentId) external {
        Payment storage p = payments[paymentId];
        require(!p.completed, "Already completed");
        require(address(this).balance >= p.amount, "Insufficient contract balance");

        p.completed = true;
        payable(p.payee).transfer(p.amount);

        emit PaymentCompleted(paymentId);
    }

    function getPayment(uint256 paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }
}
