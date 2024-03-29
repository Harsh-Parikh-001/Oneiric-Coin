const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain')

describe('Transaction Pool',() => {
    let transactionPool, transaction, senderWallet;

    senderWallet = new Wallet();
    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet()
        transaction = new Transaction({
            senderWallet,
            recipient : 'Harsh',
            amount : 69
        });
    });

    describe('setTransaction()',() => {
        it('adds a Transaction',() => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id] ).toBe(transaction);
        });
    });
    
    describe('existingTransaction()',() => {
       it('returns an existing transaction given an input address',() => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.existingTransaction({inputAddress : senderWallet.publicKey })
            ).toBe(transaction);
       });
    });


    describe('validTransactions()',() => {

        let validTransactions, errorMock;
        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;
            validTransactions = [];
            for(let i = 0 ; i < 15 ; i++){
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'world-government',
                    amount:69
                });
                if((i % 3) === 0) {
                    transaction.input.amount = 9999999999;
                }
                else if((i % 3) === 1){
                    transaction.input.signature=new Wallet().sign('data');
                }
                else{
                    validTransactions.push(transaction);
                }
                transactionPool.setTransaction(transaction);
            }
        });

        it('returns valid transaction',()=>{
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });
        it('logs error for the invalid transactions.',()=>{
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });


    describe('clear()',() => {
        it('clears the transactions',() => {
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        });
    });

    describe('clearBlockchainTransactions()',() => {
       it('clears the pool of any existing blockchain transactions',() => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for(let i = 0; i < 10; i++){
                const transaction = new Wallet().createTransaction({
                    recipient: 'world-bank',
                    amount: 15
                });
                transactionPool.setTransaction(transaction);
                if((i % 2) === 0){
                    blockchain.addBlock({data : [transaction]});
                }
                else{
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }
            transactionPool.clearBlockchainTransactions({chain : blockchain.chain});
            
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
       });

    });

});