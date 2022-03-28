const hre = require("hardhat");

async function main() {
  const Dai = await hre.ethers.getContractFactory("Dai");
  const dai = await Dai.deploy();
  await dai.deployed();
  console.log("Dai deployed to:", dai.address);
  await dai.faucet("0x0999b4c94534472309532BB39c05B199E0F9E85a", 1000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
