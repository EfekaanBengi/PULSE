import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SubscriptionFactory to Monad Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MON\n");

  // Deploy SubscriptionFactory
  const SubscriptionFactory = await ethers.getContractFactory("SubscriptionFactory");
  const factory = await SubscriptionFactory.deploy();

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("SubscriptionFactory deployed to:", factoryAddress);
  console.log("\nUpdate src/lib/contracts/addresses.ts with this address:");
  console.log(`export const SUBSCRIPTION_FACTORY_ADDRESS = "${factoryAddress}" as const;`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
