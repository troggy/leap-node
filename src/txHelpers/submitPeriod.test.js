const submitPeriod = require('./submitPeriod');

jest.mock('../utils/sendTransaction');

const ADDR = '0x4436373705394267350db2c06613990d34621d69';
const web3 = {
  eth: {
    getBlockNumber: async () => {
      return 3324234;
    },
  },
};

describe('submitPeriod', async () => {
  test('submitted period', async () => {
    const bridgeContract = {
      methods: {
        periods: () => ({
          async call() {
            return {
              timestamp: '100',
            };
          },
        }),
      },
    };

    const operatorContract = {
      getPastEvents: async () => {
        return [
          {
            returnValues: {
              blocksRoot: '0x',
              periodRoot: '0x',
            },
          },
        ];
      },
    };

    const account = {
      address: ADDR,
    };

    const period = await submitPeriod(
      {
        merkleRoot() {
          return '0x';
        },
      },
      [],
      0,
      { bridgeContract, web3, operatorContract, account }
    );
    expect(period).toEqual({
      timestamp: '100',
    });
  });

  test('not submitted, no own slot', async () => {
    let submitCalled = false;
    const bridgeContract = {
      options: {
        address: ADDR,
      },
      methods: {
        periods: () => ({
          async call() {
            return {
              timestamp: '0',
            };
          },
        }),
      },
    };
    const operatorContract = {
      options: {
        address: ADDR,
      },
      getPastEvents: async () => {
        return [
          {
            returnValues: {
              blocksRoot: '0x',
              periodRoot: '0x',
            },
          },
        ];
      },
      methods: {
        submitPeriod: () => {
          submitCalled = true;
          return {};
        },
      },
    };

    const period = await submitPeriod(
      {
        merkleRoot() {
          return '0x';
        },
      },
      [],
      0,
      {
        bridgeContract,
        operatorContract,
        web3,
        account: {
          address: ADDR,
        },
      }
    );
    expect(period).toEqual({
      timestamp: '0',
    });
    expect(submitCalled).toBe(false);
  });

  test('not submitted, own slot', async () => {
    let submitCalled = false;
    const bridgeContract = {
      options: {
        address: ADDR,
      },
      methods: {
        periods: () => ({
          async call() {
            return {
              timestamp: '0',
            };
          },
        }),
      },
    };
    const operatorContract = {
      options: {
        address: ADDR,
      },
      getPastEvents: async () => {
        return [
          {
            returnValues: {
              blocksRoot: '0x',
              periodRoot: '0x',
            },
          },
        ];
      },
      methods: {
        submitPeriod: () => {
          submitCalled = true;
          return {};
        },
      },
    };

    const period = await submitPeriod(
      {
        merkleRoot() {
          return '0x';
        },
      },
      [{ signerAddr: ADDR, id: 0 }],
      0,
      {
        operatorContract,
        bridgeContract,
        web3,
        account: {
          address: ADDR,
        },
      }
    );
    expect(period).toEqual({
      timestamp: '0',
    });
    expect(submitCalled).toBe(true);
  });
});
