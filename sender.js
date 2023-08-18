const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000; 

app.use(express.json());

let balance = 1000;

// Function to perform the sender's account deduction
async function sender(amount, senderAccount) {
  if (balance >= amount) {
    balance -= amount;
    console.log(`Deducted Amount ${amount}, Balance: ${balance}, Sender Account: ${senderAccount}`);
    return true;
  } else {
    console.log("Insufficient Balance");
    return false;
  }
}

// Set to keep track of processed transactions
const processedTransaction = new Set();

// Function to generate a unique identifier for transactions
function generateUniqueIdentifier(senderDetails, amount, receiverDetails) {
  return `${senderDetails}-${receiverDetails}+${amount}`;
}

// Function to check if a transaction is already processed
function checkIfTransactionIsDone(uniqueIdentifier) {
  return processedTransaction.has(uniqueIdentifier);
}

// Function to mark a transaction as done
function markIfTransactionIsDone(uniqueIdentifier) {
  processedTransaction.add(uniqueIdentifier);
}

// Endpoint to initiate a transaction
app.post('/send-data', async (req, res) => {
  const { senderAccount, amount, receiverAccount } = req.body;

  try {
    // Check if the transaction is already in progress
    const alreadyTransfered = await transactionInProcess(senderAccount, amount, receiverAccount);

    if (alreadyTransfered) {
      console.log("Already transferred");
      return res.json({
        success: false,
        message: "Transaction already in progress"
      });
    }

    // Try to deduct the balance from the sender's account
    const isTransferSuccess = await sender(amount, senderAccount);

    if (!isTransferSuccess) {
      console.log("Unable to make request");
      return res.json({
        success: false,
        message: "Insufficient Balance"
      });
    }

    // Prepare the request options for sending data to the receiver server
    const requestOptions = {
      method: 'POST',
      url: 'http://localhost:4000/receive-data',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        senderAccount: senderAccount,
        amount: amount,
        receiverAccount: receiverAccount,
      }
    };

    // Send the data to the receiver server
    axios(requestOptions)
      .then(response => {
        console.log('Data sent successfully to the receiver server:', response.data);
        res.status(200).json({
          message: "Transaction Done!"
        });
      })
      .catch(error => {
        console.error('Error sending data:', error.message);
        res.status(500).send('Error sending data to the receiver server.');
      });
  } catch (error) {
    res.status(500).json({
      error: "Internal Error"
    });
  }
});

// Function to check if a transaction is already in progress
async function transactionInProcess(senderAccount, amount, receiverAccount) {
  try {
    const uniqueIdentifier = generateUniqueIdentifier(senderAccount, amount, receiverAccount);
    const isProcessed = await checkIfTransactionIsDone(uniqueIdentifier);

    if (isProcessed) {
      console.log("Already in Transaction");
      return true;
    }

    markIfTransactionIsDone(uniqueIdentifier);
    return false;
  } catch (error) {
    console.error('Transaction process error:', error.message);
    return false;
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Sender Server listening on port ${port}`);
});
