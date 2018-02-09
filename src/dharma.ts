import Web3 from "web3";
import { ContractsAPI, OrderAPI, SignerAPI, AdaptersAPI } from "./apis";
import { DharmaConfig } from "./types";

export default class Dharma {
    public sign: SignerAPI;
    public order: OrderAPI;
    public contracts: ContractsAPI;
    public adapters: AdaptersAPI;

    private web3: Web3;

    constructor(web3Provider: Web3.Provider, config: DharmaConfig) {
        this.web3 = new Web3(web3Provider);

        this.sign = new SignerAPI(this.web3);
        this.contracts = new ContractsAPI(this.web3, config);

        this.order = new OrderAPI(this.web3, this.contracts);
        this.adapters = new AdaptersAPI(this.web3, this.contracts);
    }
}
