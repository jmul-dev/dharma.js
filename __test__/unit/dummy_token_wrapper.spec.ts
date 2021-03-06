jest.mock("src/artifacts/ts/DummyToken");

import * as promisify from "tiny-promisify";
import { Web3Utils } from "utils/web3_utils";
import { DummyTokenContract, TokenRegistryContract } from "src/wrappers";
import { DummyToken as MockContractArtifacts } from "src/artifacts/ts/DummyToken";
import { CONTRACT_WRAPPER_ERRORS } from "src/wrappers/contract_wrappers/base_contract_wrapper";
import { ACCOUNTS } from "../accounts";
import * as Web3 from "web3";

// We use an unmocked version of "fs" in order to pull the correct
// contract address from our artifacts for testing purposes
import * as fs from "fs";

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

const DUMMY_TOKEN_ARTIFACTS_PATH = "src/artifacts/json/DummyToken.json";

const TX_DEFAULTS = { from: ACCOUNTS[0].address, gas: 4712388 };

describe("Dummy Token Contract Wrapper (Unit)", () => {
    let networkId: number;
    let dummyTokenContractAbi: Web3.ContractAbi;
    let dummyREPTokenAddress: string;

    beforeAll(async () => {
        networkId = await web3Utils.getNetworkIdAsync();

        const readFilePromise = promisify(fs.readFile);
        const dummyTokenArtifacts = await readFilePromise(DUMMY_TOKEN_ARTIFACTS_PATH);
        const { abi } = JSON.parse(dummyTokenArtifacts);

        dummyTokenContractAbi = abi;

        const dummyTokenRegistry = await TokenRegistryContract.deployed(web3, TX_DEFAULTS);
        dummyREPTokenAddress = await dummyTokenRegistry.getTokenAddress.callAsync("REP");
    });

    // TODO: Create tests for general solidity method calls on the Debt Token contract
    describe("#at()", () => {
        describe("contract address does not point to contract", () => {
            beforeAll(async () => {
                let mockNetworks = {};

                mockNetworks[networkId] = {
                    address: ACCOUNTS[0].address,
                };

                MockContractArtifacts.mock(dummyTokenContractAbi, mockNetworks);
            });

            test("throws CONTRACT_NOT_FOUND_ON_NETWORK error", async () => {
                await expect(
                    DummyTokenContract.at(ACCOUNTS[0].address, web3, TX_DEFAULTS),
                ).rejects.toThrowError(
                    CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK("DummyToken", networkId),
                );
            });
        });

        describe("local artifacts readable and contract address associated w/ network id is valid", () => {
            beforeAll(async () => {
                let mockNetworks = {};

                mockNetworks[networkId] = {
                    address: ACCOUNTS[0].address,
                };

                MockContractArtifacts.mock(dummyTokenContractAbi, mockNetworks);
            });

            test("returns new DebtKernelWrapper w/ current address correctly set", async () => {
                const contractWrapper = await DummyTokenContract.at(
                    dummyREPTokenAddress,
                    web3,
                    TX_DEFAULTS,
                );

                expect(contractWrapper.address).toBe(dummyREPTokenAddress);
                expect(contractWrapper.abi).toEqual(dummyTokenContractAbi);
            });
        });
    });
});
