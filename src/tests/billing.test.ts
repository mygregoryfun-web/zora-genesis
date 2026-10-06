import assert from "node:assert/strict";
import test from "node:test";
import { getAddress } from "viem";
import { config } from "../config.js";
import { billingProductsPublic, paymentUriForProduct, USDC_BASE_ADDRESS } from "../services/billing.js";

test("exposes billing products with credits and prices", () => {
  const products = billingProductsPublic();

  assert.ok(products.some((product) => product.id === "credits-100" && product.credits === 100 && product.priceUsdc === 9));
  assert.ok(products.some((product) => product.id === "studio" && product.credits === 800 && product.priceUsdc === 49));
});

test("builds a Base USDC payment URI for a product", () => {
  const previousWallet = config.billingWalletAddress;
  config.billingWalletAddress = "0x8f02969998ff304bccb3d9dfe49dfdbe0acc3b6d";

  try {
    const uri = paymentUriForProduct("credits-100");

    assert.equal(
      uri,
      `ethereum:${USDC_BASE_ADDRESS}@8453/transfer?address=${getAddress(config.billingWalletAddress)}&uint256=9000000`,
    );
  } finally {
    config.billingWalletAddress = previousWallet;
  }
});

test("rejects unknown billing products", () => {
  const previousWallet = config.billingWalletAddress;
  config.billingWalletAddress = "0x8f02969998ff304bccb3d9dfe49dfdbe0acc3b6d";

  try {
    assert.throws(() => paymentUriForProduct("missing"), /ne obstaja/);
  } finally {
    config.billingWalletAddress = previousWallet;
  }
});
