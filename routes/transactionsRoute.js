const express = require('express');
const moment = require('moment');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Request Body:', req.body);
    next();
});

router.post('/add-transaction', async function (req, res) {
    try {
        const newtransaction = new Transaction(req.body);
        await newtransaction.save();
        console.log('Transaction saved:', newtransaction);
        res.send('Transaction added successfully');
    } catch (error) {
        console.error('Add Transaction Error:', error);
        res.status(500).json({ error: 'Error adding transaction' });
    }
});

router.post('/edit-transaction', async function (req, res) {
    try {
        const result = await Transaction.findOneAndUpdate(
            { _id: req.body.transactionId },
            req.body.payload,
            { new: true }
        );
        console.log('Transaction updated:', result);
        res.send('Transaction updated successfully');
    } catch (error) {
        console.error('Edit Transaction Error:', error);
        res.status(500).json({ error: 'Error editing transaction' });
    }
});

router.post('/delete-transaction', async function (req, res) {
    try {
        const result = await Transaction.findOneAndDelete({ _id: req.body.transactionId });
        console.log('Transaction deleted:', result);
        res.send('Transaction deleted successfully');
    } catch (error) {
        console.error('Delete Transaction Error:', error);
        res.status(500).json({ error: 'Error deleting transaction' });
    }
});

router.post('/get-all-transactions', async (req, res) => {
    const { frequency, selectedRange, type, userid } = req.body;
    try {
        const query = {
            ...(frequency !== 'custom'
                ? {
                    date: {
                        $gt: moment().subtract(Number(frequency), 'd').toDate(),
                    },
                }
                : {
                    date: {
                        $gte: selectedRange[0],
                        $lte: selectedRange[1],
                    },
                }),
            userid,
            ...(type !== 'all' && { type }),
        };

        console.log('MongoDB Query:', query);

        const transactions = await Transaction.find(query);
        console.log('Transactions fetched:', transactions.length);
        res.send(transactions);
    } catch (error) {
        console.error('Get All Transactions Error:', error);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

module.exports = router;
